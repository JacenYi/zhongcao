// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title 种草社区智能合约
 * @dev 实现广告任务创建、种草推广、购买分佣等核心功能
 * @notice 支持广告主创建任务、种草人接取任务、拔草人通过推荐码购买并分佣
 * @custom:security-version 1.2.0
 */
contract ZhongCaoCommunity is Ownable, Pausable, ReentrancyGuard {
    /**
     * @dev 广告任务结构体
     * @param id 任务唯一标识
     * @param advertiser 广告主地址
     * @param title 任务标题
     * @param description 任务描述
     * @param productPrice 商品价格（单位：wei）
     * @param commissionRate 分佣比例（0-100）
     * @param bonusPool 奖金池余额（用于支付分佣）
     * @param coverImageHash 商品封面图哈希
     * @param isActive 任务是否激活
     * @param createdAt 任务创建时间戳
     * @param referralCount 推荐次数统计
     * @param purchaseCount 购买次数统计
     */
    struct Task {
        uint256 id;
        address advertiser;
        string title;
        string description;
        uint256 productPrice;
        uint256 commissionRate;
        uint256 bonusPool;
        string coverImageHash;
        bool isActive;
        uint256 createdAt;
        uint256 referralCount;
        uint256 purchaseCount;
    }

    /**
     * @dev 推荐关系结构体
     * @param id 推荐唯一标识
     * @param taskId 关联的任务ID
     * @param promoter 种草人地址
     * @param refCode 推荐码
     * @param createdAt 推荐创建时间戳
     * @param purchaseCount 通过此推荐的购买次数
     */
    struct Referral {
        uint256 id;
        uint256 taskId;
        address promoter;
        string refCode;
        uint256 createdAt;
        uint256 purchaseCount;
    }

    /**
     * @dev 购买记录结构体
     * @param id 购买唯一标识
     * @param taskId 关联的任务ID
     * @param referralId 关联的推荐ID
     * @param buyer 买家地址
     * @param promoter 种草人地址
     * @param advertiser 广告主地址
     * @param productPrice 商品价格
     * @param commissionAmount 分佣金额
     * @param timestamp 购买时间戳
     */
    struct Purchase {
        uint256 id;
        uint256 taskId;
        uint256 referralId;
        address buyer;
        address promoter;
        address advertiser;
        uint256 productPrice;
        uint256 commissionAmount;
        uint256 timestamp;
    }

    // 打包的计数器（存储优化）
    struct Counters {
        uint256 taskIdCounter;
        uint256 referralIdCounter;
        uint256 purchaseIdCounter;
    }
    
    Counters private counters;

    // 任务ID到任务详情的映射
    mapping(uint256 => Task) public tasks;
    // 推荐ID到推荐详情的映射
    mapping(uint256 => Referral) public referrals;
    // 购买ID到购买详情的映射
    mapping(uint256 => Purchase) public purchases;
    // 推荐码到推荐ID的映射
    mapping(string => uint256) public refCodeToReferralId;
    // 任务ID到推荐ID列表的映射
    mapping(uint256 => uint256[]) public taskReferrals;
    // 广告主地址到任务ID列表的映射
    mapping(address => uint256[]) public advertiserTasks;
    // 种草人地址到推荐ID列表的映射
    mapping(address => uint256[]) public promoterReferrals;
    // 用户地址到购买ID列表的映射
    mapping(address => uint256[]) public userPurchases;
    // 任务ID和用户地址到是否已接取的映射（防止重复接取）
    mapping(uint256 => mapping(address => bool)) public taskAcceptedByUser;

    /**
     * @dev 任务创建事件
     * @param taskId 任务ID
     * @param advertiser 广告主地址
     * @param title 任务标题
     * @param productPrice 商品价格
     * @param commissionRate 分佣比例
     * @param bonusPool 奖金池金额
     */
    event TaskCreated(
        uint256 indexed taskId,
        address indexed advertiser,
        string title,
        uint256 productPrice,
        uint256 commissionRate,
        uint256 bonusPool
    );

    /**
     * @dev 任务关闭事件
     * @param taskId 任务ID
     * @param advertiser 广告主地址
     */
    event TaskDeactivated(uint256 indexed taskId, address indexed advertiser);

    /**
     * @dev 推荐创建事件
     * @param referralId 推荐ID
     * @param taskId 任务ID
     * @param promoter 种草人地址
     * @param refCode 推荐码
     */
    event ReferralCreated(
        uint256 indexed referralId,
        uint256 indexed taskId,
        address indexed promoter,
        string refCode
    );

    /**
     * @dev 购买完成事件
     * @param purchaseId 购买ID
     * @param taskId 任务ID
     * @param referralId 推荐ID
     * @param buyer 买家地址
     * @param promoter 种草人地址
     * @param advertiser 广告主地址
     * @param productPrice 商品价格
     * @param commissionAmount 分佣金额
     */
    event PurchaseMade(
        uint256 indexed purchaseId,
        uint256 indexed taskId,
        uint256 indexed referralId,
        address buyer,
        address promoter,
        address advertiser,
        uint256 productPrice,
        uint256 commissionAmount
    );

    /**
     * @dev 奖金池补充事件
     * @param taskId 任务ID
     * @param amount 补充金额
     * @param contributor 补充者地址
     */
    event BonusPoolAdded(uint256 indexed taskId, uint256 amount, address indexed contributor);

    /**
     * @dev 构造函数
     * @notice 初始化合约，设置所有者为部署者
     */
    constructor() Ownable(msg.sender) {
    }

    /**
     * @dev 仅任务拥有者修饰器
     * @param _taskId 任务ID
     */
    modifier onlyTaskOwner(uint256 _taskId) {
        require(tasks[_taskId].advertiser == msg.sender, "Not task owner");
        _;
    }

    /**
     * @dev 任务存在性检查修饰器
     * @param _taskId 任务ID
     */
    modifier taskExists(uint256 _taskId) {
        require(_taskId > 0 && _taskId <= counters.taskIdCounter, "Task does not exist");
        _;
    }

    /**
     * @dev 任务激活状态检查修饰器
     * @param _taskId 任务ID
     */
    modifier taskActive(uint256 _taskId) {
        require(tasks[_taskId].isActive, "Task is not active");
        _;
    }

    /**
     * @dev 创建广告任务
     * @notice 广告主可以创建种草任务，设置商品信息和分佣比例
     * @param _title 任务标题
     * @param _description 任务描述
     * @param _productPrice 商品价格（单位：wei）
     * @param _commissionRate 分佣比例（0-100）
     * @param _bonusPool 奖金池金额（单位：wei）
     * @param _coverImageHash 商品封面图哈希
     */
    function createTask(
        string memory _title,
        string memory _description,
        uint256 _productPrice,
        uint256 _commissionRate,
        uint256 _bonusPool,
        string memory _coverImageHash
    ) external payable whenNotPaused {
        // 验证参数有效性
        require(bytes(_title).length > 0 && bytes(_title).length <= 100, "Title length invalid");
        require(bytes(_description).length <= 500, "Description too long");
        require(_productPrice > 0, "Product price must be greater than 0");
        require(_commissionRate >= 0 && _commissionRate <= 100, "Invalid commission rate");
        require(_bonusPool > 0, "Bonus pool must be greater than 0");
        require(msg.value >= _bonusPool, "Insufficient bonus pool payment");

        // 生成任务ID
        counters.taskIdCounter++;
        uint256 taskId = counters.taskIdCounter;

        // 创建任务对象
        tasks[taskId] = Task({
            id: taskId,
            advertiser: msg.sender,
            title: _title,
            description: _description,
            productPrice: _productPrice,
            commissionRate: _commissionRate,
            bonusPool: _bonusPool,
            coverImageHash: _coverImageHash,
            isActive: true,
            createdAt: block.timestamp,
            referralCount: 0,
            purchaseCount: 0
        });

        // 记录广告主的任务列表
        advertiserTasks[msg.sender].push(taskId);

        // 触发任务创建事件
        emit TaskCreated(taskId, msg.sender, _title, _productPrice, _commissionRate, _bonusPool);
    }

    /**
     * @dev 接取广告任务
     * @notice 种草人可以接取激活的广告任务，生成唯一推荐码
     * @param _taskId 任务ID
     */
    function acceptTask(uint256 _taskId) external whenNotPaused taskExists(_taskId) taskActive(_taskId) {
        // 检查用户是否已接取过此任务
        require(!taskAcceptedByUser[_taskId][msg.sender], "Already accepted this task");

        // 生成唯一推荐码
        string memory refCode = _generateRefCode(msg.sender, _taskId, block.timestamp);

        // 生成推荐ID
        counters.referralIdCounter++;
        uint256 referralId = counters.referralIdCounter;

        // 创建推荐对象
        referrals[referralId] = Referral({
            id: referralId,
            taskId: _taskId,
            promoter: msg.sender,
            refCode: refCode,
            createdAt: block.timestamp,
            purchaseCount: 0
        });

        // 建立推荐码到推荐ID的映射
        refCodeToReferralId[refCode] = referralId;
        // 记录任务的推荐列表
        taskReferrals[_taskId].push(referralId);
        // 记录种草人的推荐列表
        promoterReferrals[msg.sender].push(referralId);
        // 标记用户已接取此任务
        taskAcceptedByUser[_taskId][msg.sender] = true;
        // 更新任务的推荐计数
        tasks[_taskId].referralCount++;

        // 触发推荐创建事件
        emit ReferralCreated(referralId, _taskId, msg.sender, refCode);
    }

    /**
     * @dev 通过推荐码购买商品
     * @notice 拔草人可以通过种草人的推荐码购买商品，系统自动分佣
     * @param _refCode 推荐码
     */
    function purchase(string memory _refCode) external payable whenNotPaused nonReentrant {
        // 验证推荐码有效性
        uint256 referralId = refCodeToReferralId[_refCode];
        require(referralId > 0, "Invalid referral code");

        // 获取推荐和任务信息
        Referral storage referral = referrals[referralId];
        Task storage task = tasks[referral.taskId];

        // 验证任务状态
        require(task.isActive, "Task is not active");

        // 验证购买金额
        require(msg.value == task.productPrice, "Incorrect payment amount");

        // 验证奖金池余额
        uint256 commissionAmount = (msg.value * task.commissionRate) / 100;
        require(task.bonusPool >= commissionAmount, "Insufficient bonus pool");

        // 生成购买ID
        counters.purchaseIdCounter++;
        uint256 purchaseId = counters.purchaseIdCounter;

        // 先更新状态，防止重入攻击
        task.bonusPool -= commissionAmount;
        task.purchaseCount++;
        referral.purchaseCount++;

        // 创建购买记录
        purchases[purchaseId] = Purchase({
            id: purchaseId,
            taskId: referral.taskId,
            referralId: referralId,
            buyer: msg.sender,
            promoter: referral.promoter,
            advertiser: task.advertiser,
            productPrice: msg.value,
            commissionAmount: commissionAmount,
            timestamp: block.timestamp
        });

        // 记录用户的购买列表
        userPurchases[msg.sender].push(purchaseId);

        // 转账分佣给种草人
        (bool success, ) = payable(referral.promoter).call{value: commissionAmount}("");
        require(success, "Failed to send commission to promoter");

        // 转账商品金额给广告主
        (bool success2, ) = payable(task.advertiser).call{value: msg.value}("");
        require(success2, "Failed to send payment to advertiser");

        // 触发购买完成事件
        emit PurchaseMade(
            purchaseId,
            referral.taskId,
            referralId,
            msg.sender,
            referral.promoter,
            task.advertiser,
            msg.value,
            commissionAmount
        );
    }

    /**
     * @dev 补充任务奖金池
     * @notice 广告主可以补充任务的奖金池
     * @param _taskId 任务ID
     */
    function addBonusPool(uint256 _taskId) external payable whenNotPaused taskExists(_taskId) onlyTaskOwner(_taskId) {
        require(msg.value > 0, "Amount must be greater than 0");
        
        tasks[_taskId].bonusPool += msg.value;

        emit BonusPoolAdded(_taskId, msg.value, msg.sender);
    }

    /**
     * @dev 关闭广告任务
     * @notice 广告主可以关闭自己创建的任务，退还剩余奖金池
     * @param _taskId 任务ID
     */
    function deactivateTask(uint256 _taskId) external whenNotPaused taskExists(_taskId) onlyTaskOwner(_taskId) {
        require(tasks[_taskId].isActive, "Task already deactivated");

        // 关闭任务
        tasks[_taskId].isActive = false;

        // 退还剩余奖金池给广告主
        uint256 remainingPool = tasks[_taskId].bonusPool;
        if (remainingPool > 0) {
            tasks[_taskId].bonusPool = 0;
            (bool success, ) = payable(msg.sender).call{value: remainingPool}("");
            require(success, "Failed to refund bonus pool");
        }

        // 触发任务关闭事件
        emit TaskDeactivated(_taskId, msg.sender);
    }

    /**
     * @dev 获取任务详情
     * @param _taskId 任务ID
     * @return 任务详情
     */
    function getTask(uint256 _taskId) external view taskExists(_taskId) returns (Task memory) {
        return tasks[_taskId];
    }

    /**
     * @dev 获取推荐详情
     * @param _referralId 推荐ID
     * @return 推荐详情
     */
    function getReferral(uint256 _referralId) external view returns (Referral memory) {
        require(_referralId > 0 && _referralId <= counters.referralIdCounter, "Referral does not exist");
        return referrals[_referralId];
    }

    /**
     * @dev 获取购买详情
     * @param _purchaseId 购买ID
     * @return 购买详情
     */
    function getPurchase(uint256 _purchaseId) external view returns (Purchase memory) {
        require(_purchaseId > 0 && _purchaseId <= counters.purchaseIdCounter, "Purchase does not exist");
        return purchases[_purchaseId];
    }

    /**
     * @dev 获取广告主的所有任务
     * @param _advertiser 广告主地址
     * @return 任务ID数组
     */
    function getAdvertiserTasks(address _advertiser) external view returns (uint256[] memory) {
        return advertiserTasks[_advertiser];
    }

    /**
     * @dev 获取种草人的所有推荐
     * @param _promoter 种草人地址
     * @return 推荐ID数组
     */
    function getPromoterReferrals(address _promoter) external view returns (uint256[] memory) {
        return promoterReferrals[_promoter];
    }

    /**
     * @dev 获取用户的所有购买记录
     * @param _user 用户地址
     * @return 购买ID数组
     */
    function getUserPurchases(address _user) external view returns (uint256[] memory) {
        return userPurchases[_user];
    }

    /**
     * @dev 获取种草人的所有分佣记录
     * @param _promoter 种草人地址
     * @return 购买ID数组
     */
    function getPromoterPurchases(address _promoter) external view returns (uint256[] memory) {
        // 创建临时数组
        uint256[] memory purchaseIds = new uint256[](counters.purchaseIdCounter);
        uint256 count = 0;

        // 遍历所有购买记录，筛选出指定种草人的购买
        for (uint256 i = 1; i <= counters.purchaseIdCounter; i++) {
            if (purchases[i].promoter == _promoter) {
                purchaseIds[count] = i;
                count++;
            }
        }

        // 创建最终结果数组
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = purchaseIds[i];
        }

        return result;
    }

    /**
     * @dev 获取所有激活的任务详情
     * @return 激活任务ID数组
     */
    function getAllTasks() external view returns (uint256[] memory) {
        // 统计激活任务数量
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= counters.taskIdCounter; i++) {
            if (tasks[i].isActive) {
                activeCount++;
            }
        }

        // 创建激活任务ID数组
        uint256[] memory activeTaskIds = new uint256[](activeCount);
        uint256 index = 0;

        // 填充激活任务ID
        for (uint256 i = 1; i <= counters.taskIdCounter; i++) {
            if (tasks[i].isActive) {
                activeTaskIds[index] = i;
                index++;
            }
        }

        return activeTaskIds;
    }

    /**
     * @dev 获取种草人排行榜
     * @param _limit 返回的排行榜数量限制
     * @return 种草人地址数组
     * @return 分佣金额数组
     */
    function getPromoterLeaderboard(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        // 创建临时数组用于存储种草人地址和分佣金额
        address[] memory tempAddresses = new address[](counters.purchaseIdCounter);
        uint256[] memory tempCommissions = new uint256[](counters.purchaseIdCounter);
        uint256 promoterCount = 0;

        // 遍历所有购买记录，统计每个种草人的分佣金额
        for (uint256 i = 1; i <= counters.purchaseIdCounter; i++) {
            address promoter = purchases[i].promoter;
            bool found = false;
            
            // 检查是否已经记录过该种草人
            for (uint256 j = 0; j < promoterCount; j++) {
                if (tempAddresses[j] == promoter) {
                    tempCommissions[j] += purchases[i].commissionAmount;
                    found = true;
                    break;
                }
            }
            
            // 如果是新种草人，添加到数组
            if (!found) {
                tempAddresses[promoterCount] = promoter;
                tempCommissions[promoterCount] = purchases[i].commissionAmount;
                promoterCount++;
            }
        }

        // 创建结果数组
        address[] memory resultAddresses = new address[](promoterCount);
        uint256[] memory resultCommissions = new uint256[](promoterCount);

        // 填充结果数组
        for (uint256 i = 0; i < promoterCount; i++) {
            resultAddresses[i] = tempAddresses[i];
            resultCommissions[i] = tempCommissions[i];
        }

        // 简单排序（冒泡排序）
        for (uint256 i = 0; i < promoterCount - 1; i++) {
            for (uint256 j = 0; j < promoterCount - i - 1; j++) {
                if (resultCommissions[j] < resultCommissions[j + 1]) {
                    // 交换地址
                    address tempAddr = resultAddresses[j];
                    resultAddresses[j] = resultAddresses[j + 1];
                    resultAddresses[j + 1] = tempAddr;
                    // 交换金额
                    uint256 tempComm = resultCommissions[j];
                    resultCommissions[j] = resultCommissions[j + 1];
                    resultCommissions[j + 1] = tempComm;
                }
            }
        }

        // 限制返回数量
        if (_limit > 0 && _limit < promoterCount) {
            address[] memory limitedAddresses = new address[](_limit);
            uint256[] memory limitedCommissions = new uint256[](_limit);
            for (uint256 i = 0; i < _limit; i++) {
                limitedAddresses[i] = resultAddresses[i];
                limitedCommissions[i] = resultCommissions[i];
            }
            return (limitedAddresses, limitedCommissions);
        }

        return (resultAddresses, resultCommissions);
    }

    /**
     * @dev 生成推荐码
     * @param _promoter 种草人地址
     * @param _taskId 任务ID
     * @param _timestamp 时间戳
     * @return 推荐码
     */
    function _generateRefCode(address _promoter, uint256 _taskId, uint256 _timestamp) private pure returns (string memory) {
        bytes memory promoBytes = abi.encodePacked(_promoter, _taskId, _timestamp);
        bytes32 hash = keccak256(promoBytes);
        bytes memory alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        bytes memory result = new bytes(12);

        for (uint256 i = 0; i < 12; i++) {
            result[i] = alphabet[uint8(hash[i]) % 62];
        }

        return string(result);
    }
}
