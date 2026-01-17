import { ethers, formatEther, parseEther } from 'ethers';

// 从 JSON 文件导入完整 ABI
const ZHONG_CAO_COMMUNITY_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[],"name":"EnforcedPause","type":"error"},
  {"inputs":[],"name":"ExpectedPause","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"contributor","type":"address"}],"name":"BonusPoolAdded","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"purchaseId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"referralId","type":"uint256"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"address","name":"promoter","type":"address"},{"indexed":false,"internalType":"address","name":"advertiser","type":"address"},{"indexed":false,"internalType":"uint256","name":"productPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"commissionAmount","type":"uint256"}],"name":"PurchaseMade","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"referralId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"address","name":"promoter","type":"address"},{"indexed":false,"internalType":"string","name":"refCode","type":"string"}],"name":"ReferralCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"address","name":"advertiser","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"uint256","name":"productPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"commissionRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"bonusPool","type":"uint256"}],"name":"TaskCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"address","name":"advertiser","type":"address"}],"name":"TaskDeactivated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},
  {"inputs":[{"internalType":"uint256","name":"_taskId","type":"uint256"}],"name":"acceptTask","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_taskId","type":"uint256"}],"name":"addBonusPool","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"advertiserTasks","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_productPrice","type":"uint256"},{"internalType":"uint256","name":"_commissionRate","type":"uint256"},{"internalType":"uint256","name":"_bonusPool","type":"uint256"},{"internalType":"string","name":"_coverImageHash","type":"string"}],"name":"createTask","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_taskId","type":"uint256"}],"name":"deactivateTask","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_advertiser","type":"address"}],"name":"getAdvertiserTasks","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getAllTasks","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getPromoterLeaderboard","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_promoter","type":"address"}],"name":"getPromoterPurchases","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_promoter","type":"address"}],"name":"getPromoterReferrals","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_purchaseId","type":"uint256"}],"name":"getPurchase","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"taskId","type":"uint256"},{"internalType":"uint256","name":"referralId","type":"uint256"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"address","name":"promoter","type":"address"},{"internalType":"address","name":"advertiser","type":"address"},{"internalType":"uint256","name":"productPrice","type":"uint256"},{"internalType":"uint256","name":"commissionAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct ZhongCaoCommunity.Purchase","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_referralId","type":"uint256"}],"name":"getReferral","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"taskId","type":"uint256"},{"internalType":"address","name":"promoter","type":"address"},{"internalType":"string","name":"refCode","type":"string"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"purchaseCount","type":"uint256"}],"internalType":"struct ZhongCaoCommunity.Referral","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_taskId","type":"uint256"}],"name":"getTask","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"advertiser","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"productPrice","type":"uint256"},{"internalType":"uint256","name":"commissionRate","type":"uint256"},{"internalType":"uint256","name":"bonusPool","type":"uint256"},{"internalType":"string","name":"coverImageHash","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"referralCount","type":"uint256"},{"internalType":"uint256","name":"purchaseCount","type":"uint256"}],"internalType":"struct ZhongCaoCommunity.Task","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserPurchases","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"promoterReferrals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_refCode","type":"string"}],"name":"purchase","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"purchases","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"taskId","type":"uint256"},{"internalType":"uint256","name":"referralId","type":"uint256"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"address","name":"promoter","type":"address"},{"internalType":"address","name":"advertiser","type":"address"},{"internalType":"uint256","name":"productPrice","type":"uint256"},{"internalType":"uint256","name":"commissionAmount","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"refCodeToReferralId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"referrals","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint256","name":"taskId","type":"uint256"},{"internalType":"address","name":"promoter","type":"address"},{"internalType":"string","name":"refCode","type":"string"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"purchaseCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"taskAcceptedByUser","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"taskReferrals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"tasks","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"advertiser","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"uint256","name":"productPrice","type":"uint256"},{"internalType":"uint256","name":"commissionRate","type":"uint256"},{"internalType":"uint256","name":"bonusPool","type":"uint256"},{"internalType":"string","name":"coverImageHash","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint256","name":"referralCount","type":"uint256"},{"internalType":"uint256","name":"purchaseCount","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"userPurchases","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const ZHONG_CAO_COMMUNITY_ADDRESS = '0xFEA6f94BDd7b30F737560ccBb610cA59E1e125C3'; // 测试网合约地址

/**
 * 获取 ZhongCaoCommunity 合约实例
 * @returns {Promise<ethers.Contract>} 合约实例
 */
const getZhongCaoCommunityContract = async () => {
   if (!window.ethereum) {
      throw new Error('请先安装 MetaMask 或其他以太坊钱包');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(ZHONG_CAO_COMMUNITY_ADDRESS, ZHONG_CAO_COMMUNITY_ABI, signer);
};

/**
 * Ethereum 服务类
 * 提供与 ZhongCaoCommunity 合约的交互方法
 */
class EthereumService {
  /**
   * 创建广告任务
   * @param {string} title - 任务标题
   * @param {string} description - 任务描述
   * @param {string} productPrice - 商品价格（以太币，字符串形式）
   * @param {number} commissionRate - 分佣比例（0-100）
   * @param {string} bonusPool - 奖金池金额（以太币，字符串形式）
   * @param {string} coverImageHash - 商品封面图哈希
   * @returns {Promise<number>} 创建的任务ID
   */
  async createTask(title, description, productPrice, commissionRate, bonusPool, coverImageHash) {
    const contract = await getZhongCaoCommunityContract();
    
    // 转换为合约需要的格式
    const parsedProductPrice = parseEther(productPrice);
    const parsedBonusPool = parseEther(bonusPool);
    
    try {
      // 发送交易
      const tx = await contract.createTask(
        title,
        description,
        parsedProductPrice,
        commissionRate,
        parsedBonusPool,
        coverImageHash,
        { value: parsedBonusPool }
      );
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      // 从事件中提取 taskId
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'TaskCreated') {
            return Number(parsedLog.args.taskId);
          }
        } catch (e) {
          // 跳过无法解析的日志
          continue;
        }
      }
      
      throw new Error('无法从交易中提取任务ID');
    } catch (error) {
      console.error('创建任务失败:', error);
      
      // 提取更友好的错误信息
      if (error.message.includes('Title length invalid')) {
        throw new Error('任务标题长度无效');
      } else if (error.message.includes('Description too long')) {
        throw new Error('任务描述过长');
      } else if (error.message.includes('Product price must be greater than 0')) {
        throw new Error('商品价格必须大于0');
      } else if (error.message.includes('Invalid commission rate')) {
        throw new Error('无效的分佣比例');
      } else if (error.message.includes('Bonus pool must be greater than 0')) {
        throw new Error('奖金池金额必须大于0');
      } else if (error.message.includes('Insufficient bonus pool payment')) {
        throw new Error('发送的金额与奖金池不匹配');
      } else {
        throw new Error(`创建任务失败: ${error.message}`);
      }
    }
  }

  /**
   * 接取广告任务
   * @param {number} taskId - 任务ID
   * @returns {Promise<string>} 生成的推荐码
   */
  async acceptTask(taskId) {
    // 参数验证
    if (typeof taskId !== 'number' || taskId <= 0) {
      throw new Error('任务ID必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract();
    
    try {
      // 发送交易
      const tx = await contract.acceptTask(taskId);
      const receipt = await tx.wait();
      
      // 从事件中提取 refCode
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'ReferralCreated') {
            return parsedLog.args.refCode;
          }
        } catch (e) {
          // 跳过无法解析的日志
          continue;
        }
      }
      
      throw new Error('无法从交易中提取推荐码');
    } catch (error) {
      console.error('接取任务失败:', error);
      
      // 提取更友好的错误信息
      if (error.message.includes('Task does not exist')) {
        throw new Error('任务不存在');
      } else if (error.message.includes('Task is not active')) {
        throw new Error('任务已关闭或未激活');
      } else if (error.message.includes('Already accepted this task')) {
        throw new Error('您已经接取过该任务');
      } else {
        throw new Error(`接取任务失败: ${error.message}`);
      }
    }
  }

  /**
   * 购买商品并自动分佣
   * @param {string} refCode - 推荐码
   * @param {string} productPrice - 商品价格（以太币，字符串形式）
   * @returns {Promise<number>} 购买记录ID
   */
  async purchase(refCode, productPrice) {
    // 参数验证
    if (typeof refCode !== 'string' || refCode === '') {
      throw new Error('推荐码必须是非空字符串');
    }
    
    const contract = await getZhongCaoCommunityContract();
    
    try {
      const parsedPrice = parseEther(productPrice);
      
      // 发送交易
      const tx = await contract.purchase(refCode, { value: parsedPrice });
      const receipt = await tx.wait();
      
      // 从事件中提取 purchaseId
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === 'PurchaseMade') {
            return Number(parsedLog.args.purchaseId);
          }
        } catch (e) {
          // 跳过无法解析的日志
          continue;
        }
      }
      
      throw new Error('无法从交易中提取购买记录ID');
    } catch (error) {
      console.error('购买商品失败:', error);
      
      // 提取更友好的错误信息
      if (error.message.includes('Invalid referral code')) {
        throw new Error('无效的推荐码');
      } else if (error.message.includes('Task is not active')) {
        throw new Error('任务已关闭或未激活');
      } else if (error.message.includes('Incorrect payment amount')) {
        throw new Error('发送的金额与商品价格不匹配');
      } else if (error.message.includes('Insufficient bonus pool')) {
        throw new Error('任务奖金池余额不足');
      } else {
        throw new Error(`购买商品失败: ${error.message}`);
      }
    }
  }

  /**
   * 补充任务奖金池
   * @param {number} taskId - 任务ID
   * @param {string} amount - 补充金额（以太币，字符串形式）
   * @returns {Promise<void>}
   */
  async addBonusPool(taskId, amount) {
    // 参数验证
    if (typeof taskId !== 'number' || taskId <= 0) {
      throw new Error('任务ID必须是大于0的数字');
    }
    
    if (typeof amount !== 'string' || parseFloat(amount) <= 0) {
      throw new Error('补充金额必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract();
    
    try {
      const parsedAmount = parseEther(amount);
      
      const tx = await contract.addBonusPool(taskId, { value: parsedAmount });
      await tx.wait();
    } catch (error) {
      console.error('补充奖金池失败:', error);
      
      // 提取更友好的错误信息
      if (error.message.includes('Task does not exist')) {
        throw new Error('任务不存在');
      } else if (error.message.includes('Not task owner')) {
        throw new Error('只有任务所有者才能补充奖金池');
      } else if (error.message.includes('Amount must be greater than 0')) {
        throw new Error('补充金额必须大于0');
      } else {
        throw new Error(`补充奖金池失败: ${error.message}`);
      }
    }
  }

  /**
   * 关闭广告任务
   * @param {number} taskId - 任务ID
   * @returns {Promise<void>}
   */
  async deactivateTask(taskId) {
    // 参数验证
    if (typeof taskId !== 'number' || taskId <= 0) {
      throw new Error('任务ID必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract();
    
    try {
      const tx = await contract.deactivateTask(taskId);
      await tx.wait();
    } catch (error) {
      console.error('关闭任务失败:', error);
      
      // 提取更友好的错误信息
      if (error.message.includes('Task does not exist')) {
        throw new Error('任务不存在');
      } else if (error.message.includes('Not task owner')) {
        throw new Error('只有任务所有者才能关闭任务');
      } else if (error.message.includes('Task already deactivated')) {
        throw new Error('任务已经关闭');
      } else {
        throw new Error(`关闭任务失败: ${error.message}`);
      }
    }
  }

  /**
   * 获取任务详情
   * @param {number} taskId - 任务ID
   * @returns {Promise<Object>} 任务详情对象
   */
  async getTask(taskId) {
    // 参数验证
    if (typeof taskId !== 'number' || taskId <= 0) {
      throw new Error('任务ID必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const task = await contract.getTask(taskId);
      
      // 检查任务是否存在（合约返回默认值，如果id为0则不存在）
      if (Number(task.id) === 0) {
        throw new Error('任务不存在');
      }
      
      return {
        id: Number(task.id),
        advertiser: task.advertiser,
        title: task.title,
        description: task.description,
        productPrice: formatEther(task.productPrice),
        commissionRate: Number(task.commissionRate),
        bonusPool: formatEther(task.bonusPool),
        coverImageHash: task.coverImageHash,
        isActive: task.isActive,
        createdAt: new Date(Number(task.createdAt) * 1000).toLocaleString('zh-CN'),
        referralCount: Number(task.referralCount),
        purchaseCount: Number(task.purchaseCount)
      };
    } catch (error) {
      console.error('获取任务详情失败:', error);
      if (error.message.includes('Task does not exist')) {
        throw new Error('任务不存在');
      }
      throw error;
    }
  }

  /**
   * 获取推荐详情
   * @param {number} referralId - 推荐ID
   * @returns {Promise<Object>} 推荐详情对象
   */
  async getReferral(referralId) {
    // 参数验证
    if (typeof referralId !== 'number' || referralId <= 0) {
      throw new Error('推荐ID必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const referral = await contract.getReferral(referralId);
      
      // 检查推荐是否存在
      if (Number(referral.id) === 0) {
        throw new Error('推荐记录不存在');
      }
      
      return {
        id: Number(referral.id),
        taskId: Number(referral.taskId),
        promoter: referral.promoter,
        refCode: referral.refCode,
        createdAt: new Date(Number(referral.createdAt) * 1000).toLocaleString('zh-CN'),
        purchaseCount: Number(referral.purchaseCount)
      };
    } catch (error) {
      console.error('获取推荐详情失败:', error);
      if (error.message.includes('Referral does not exist')) {
        throw new Error('推荐记录不存在');
      }
      throw error;
    }
  }

  /**
   * 获取购买详情
   * @param {number} purchaseId - 购买ID
   * @returns {Promise<Object>} 购买详情对象
   */
  async getPurchase(purchaseId) {
    // 参数验证
    if (typeof purchaseId !== 'number' || purchaseId <= 0) {
      throw new Error('购买ID必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const purchase = await contract.getPurchase(purchaseId);
      
      // 检查购买记录是否存在
      if (Number(purchase.id) === 0) {
        throw new Error('购买记录不存在');
      }
      
      return {
        id: Number(purchase.id),
        taskId: Number(purchase.taskId),
        referralId: Number(purchase.referralId),
        buyer: purchase.buyer,
        promoter: purchase.promoter,
        advertiser: purchase.advertiser,
        productPrice: formatEther(purchase.productPrice),
        commissionAmount: formatEther(purchase.commissionAmount),
        timestamp: new Date(Number(purchase.timestamp) * 1000).toLocaleString('zh-CN')
      };
    } catch (error) {
      console.error('获取购买详情失败:', error);
      if (error.message.includes('Purchase does not exist')) {
        throw new Error('购买记录不存在');
      }
      throw error;
    }
  }

  /**
   * 获取广告主创建的所有任务
   * @param {string} advertiser - 广告主地址
   * @returns {Promise<number[]>} 任务ID列表
   */
  async getAdvertiserTasks(advertiser) {
    // 参数验证
    if (typeof advertiser !== 'string' || advertiser === '') {
      throw new Error('广告主地址必须是非空字符串');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    const taskIds = await contract.getAdvertiserTasks(advertiser);
    return taskIds.map(id => Number(id));
  }

  /**
   * 获取种草人接取的所有推荐
   * @param {string} promoter - 种草人地址
   * @returns {Promise<number[]>} 推荐ID列表
   */
  async getPromoterReferrals(promoter) {
    // 参数验证
    if (typeof promoter !== 'string' || promoter === '') {
      throw new Error('种草人地址必须是非空字符串');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    const referralIds = await contract.getPromoterReferrals(promoter);
    return referralIds.map(id => Number(id));
  }

  /**
   * 获取用户的所有购买记录
   * @param {string} user - 用户地址
   * @returns {Promise<number[]>} 购买ID列表
   */
  async getUserPurchases(user) {
    // 参数验证
    if (typeof user !== 'string' || user === '') {
      throw new Error('用户地址必须是非空字符串');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    const purchaseIds = await contract.getUserPurchases(user);
    return purchaseIds.map(id => Number(id));
  }

  /**
   * 获取种草人的所有分佣记录
   * @param {string} promoter - 种草人地址
   * @returns {Promise<number[]>} 购买记录ID列表
   */
  async getPromoterPurchases(promoter) {
    // 参数验证
    if (typeof promoter !== 'string' || promoter === '') {
      throw new Error('种草人地址必须是非空字符串');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const purchaseIds = await contract.getPromoterPurchases(promoter);
      return purchaseIds.map(id => Number(id));
    } catch (error) {
      console.error('获取种草人分佣记录失败:', error);
      return [];
    }
  }

  /**
   * 获取所有激活的任务ID
   * @returns {Promise<number[]>} 激活任务ID数组
   */
  async getAllTasks() {
    const contract = await getZhongCaoCommunityContract(true);
    const taskIds = await contract.getAllTasks();
    return taskIds.map(id => Number(id));
  }

  /**
   * 获取种草人排行榜
   * @param {number} limit - 排行榜数量限制
   * @returns {Promise<Array>} 种草人排行榜数据
   */
  async getPromoterLeaderboard(limit = 5) {
    // 参数验证
    if (typeof limit !== 'number' || limit <= 0) {
      throw new Error('排行榜数量限制必须是大于0的数字');
    }
    
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const [addresses, commissions] = await contract.getPromoterLeaderboard(limit);
      
      // 格式化排行榜数据
      return addresses.map((address, index) => ({
        rank: index + 1,
        address: address,
        earnings: formatEther(commissions[index]),
        formattedEarnings: parseFloat(formatEther(commissions[index])).toFixed(2)
      }));
    } catch (error) {
      console.error('获取种草人排行榜失败:', error);
      return [];
    }
  }

  /**
   * 获取所有激活任务的详细信息
   * @returns {Promise<Array>} 任务详情数组
   */
  async getAllTaskDetails() {
    const contract = await getZhongCaoCommunityContract(true);
    
    try {
      const taskIds = await contract.getAllTasks();
      
      // 并行获取所有任务详情
      const taskDetails = await Promise.all(taskIds.map(async (taskId) => {
        try {
          return await this.getTask(Number(taskId));
        } catch (error) {
          console.error(`获取任务 ${taskId} 详情失败:`, error);
          return null;
        }
      }));
      
      // 过滤掉失败的任务
      return taskDetails.filter(task => task !== null);
    } catch (error) {
      console.error('获取所有任务详情失败:', error);
      return [];
    }
  }

  /**
   * 获取种草人的所有任务详情
   * @param {string} promoter - 种草人地址
   * @returns {Promise<Array>} 任务详情数组
   */
  async getPromoterTaskDetails(promoter) {
    // 参数验证
    if (typeof promoter !== 'string' || promoter === '') {
      throw new Error('种草人地址必须是非空字符串');
    }
    
    try {
      // 获取种草人的所有推荐
      const referralIds = await this.getPromoterReferrals(promoter);
      
      if (referralIds.length === 0) {
        return [];
      }
      
      // 获取所有推荐详情
      const referrals = await Promise.all(referralIds.map(id => this.getReferral(id)));
      
      // 获取所有任务详情
      const taskDetails = await Promise.all(referrals.map(async (referral) => {
        try {
          const task = await this.getTask(referral.taskId);
          return {
            ...task,
            refCode: referral.refCode, // 传递refCode
            referralId: referral.id, // 添加推荐ID
            referralCreatedAt: referral.createdAt // 添加推荐创建时间
          };
        } catch (error) {
          console.error(`获取任务 ${referral.taskId} 详情失败:`, error);
          return null;
        }
      }));
      
      // 过滤掉失败的任务
      return taskDetails.filter(task => task !== null);
    } catch (error) {
      console.error('获取种草人任务详情失败:', error);
      return [];
    }
  }

  /**
   * 获取种草人的分佣记录详情
   * @param {string} promoter - 种草人地址
   * @returns {Promise<Array>} 分佣记录详情数组
   */
  async getPromoterCommissionDetails(promoter) {
    // 参数验证
    if (typeof promoter !== 'string' || promoter === '') {
      throw new Error('种草人地址必须是非空字符串');
    }
    
    try {
      // 获取种草人的所有分佣记录ID
      const purchaseIds = await this.getPromoterPurchases(promoter);
      
      if (purchaseIds.length === 0) {
        return [];
      }
      
      // 并行获取所有购买记录详情
      const commissionDetails = await Promise.all(purchaseIds.map(async (purchaseId) => {
        try {
          const purchase = await this.getPurchase(purchaseId);
          const task = await this.getTask(purchase.taskId);
          
          return {
            id: purchase.id,
            time: purchase.timestamp,
            product: task.title,
            amount: purchase.productPrice,
            commission: purchase.commissionAmount,
            status: '已结算',
            taskId: task.id
          };
        } catch (error) {
          console.error(`获取分佣记录 ${purchaseId} 详情失败:`, error);
          return null;
        }
      }));
      
      // 过滤掉失败的记录并按时间倒序排序
      return commissionDetails
        .filter(detail => detail !== null)
        .sort((a, b) => new Date(b.time) - new Date(a.time));
    } catch (error) {
      console.error('获取种草人分佣记录详情失败:', error);
      return [];
    }
  }

  /**
   * 获取广告主的所有任务详情
   * @param {string} advertiser - 广告主地址
   * @returns {Promise<Array>} 任务详情数组
   */
  async getAdvertiserTaskDetails(advertiser) {
    // 参数验证
    if (typeof advertiser !== 'string' || advertiser === '') {
      throw new Error('广告主地址必须是非空字符串');
    }
    
    try {
      // 获取广告主的所有任务ID
      const taskIds = await this.getAdvertiserTasks(advertiser);
      
      if (taskIds.length === 0) {
        return [];
      }
      
      // 并行获取所有任务详情
      const taskDetails = await Promise.all(taskIds.map(async (taskId) => {
        try {
          return await this.getTask(taskId);
        } catch (error) {
          console.error(`获取任务 ${taskId} 详情失败:`, error);
          return null;
        }
      }));
      
      // 过滤掉失败的任务
      return taskDetails.filter(task => task !== null);
    } catch (error) {
      console.error('获取广告主任务详情失败:', error);
      return [];
    }
  }

  /**
   * 获取用户的消费记录详情
   * @param {string} user - 用户地址
   * @returns {Promise<Array>} 消费记录详情数组
   */
  async getUserConsumptionDetails(user) {
    // 参数验证
    if (typeof user !== 'string' || user === '') {
      throw new Error('用户地址必须是非空字符串');
    }
    
    try {
      // 获取用户的所有购买记录ID
      const purchaseIds = await this.getUserPurchases(user);
      
      if (purchaseIds.length === 0) {
        return [];
      }
      
      // 并行获取所有购买记录详情
      const consumptionDetails = await Promise.all(purchaseIds.map(async (purchaseId) => {
        try {
          const purchase = await this.getPurchase(purchaseId);
          const task = await this.getTask(purchase.taskId);
          
          return {
            id: purchase.id,
            time: purchase.timestamp,
            amount: purchase.productPrice,
            productName: task.title,
            advertiser: task.advertiser,
            commission: purchase.commissionAmount,
            status: '已完成'
          };
        } catch (error) {
          console.error(`获取消费记录 ${purchaseId} 详情失败:`, error);
          return null;
        }
      }));
      
      // 过滤掉失败的记录并按时间倒序排序
      return consumptionDetails
        .filter(detail => detail !== null)
        .sort((a, b) => new Date(b.time) - new Date(a.time));
    } catch (error) {
      console.error('获取用户消费记录详情失败:', error);
      return [];
    }
  }
}

// 导出单例实例
const ethereumService = new EthereumService();

export {
  ethereumService
};
export {
  EthereumService
};