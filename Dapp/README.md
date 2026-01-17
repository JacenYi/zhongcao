# 种草社区 DApp

基于 Vue3 + Vite + Ethers.js + Arco Design 开发的以太坊智能合约 DApp，实现广告主创建任务、种草人推广商品、消费者购买商品并自动分佣的完整业务流程。

## 项目介绍

种草社区是一个连接广告主、种草人和消费者的区块链平台，通过智能合约实现透明、自动的分佣机制。广告主可以创建种草任务，设置商品信息和分佣比例；种草人可以接取任务并生成专属推荐码进行推广；消费者通过推荐码购买商品后，系统会自动将佣金分配给对应的种草人。

## 技术栈

### 前端技术
- **node**: node.js(20.19.4)
- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI组件库**: Arco Design
- **区块链交互**: Ethers.js 6
- **样式**: CSS (原生)

### 后端/区块链技术
- **智能合约**: Solidity ^0.8.28
- **测试网络**: Monad Testnet
- **开发框架**: OpenZeppelin Contracts
- **部署工具**: Hardhat (推测)

## 功能模块

### 1. 广告主功能
- ✅ 创建种草任务（设置商品信息、分佣比例、奖金池）
- ✅ 管理已创建的任务
- ✅ 补充任务奖金池
- ✅ 关闭任务
- ✅ 查看任务统计数据

### 2. 种草人功能
- ✅ 浏览和接取激活的任务
- ✅ 生成专属推荐码
- ✅ 查看已接取的任务
- ✅ 查看分佣记录和统计数据
- ✅ 查看种草人排行榜

### 3. 消费者功能
- ✅ 通过推荐码查看商品详情
- ✅ 使用推荐码购买商品
- ✅ 查看购买历史记录
- ✅ 自动分佣给种草人

### 4. 钱包功能
- ✅ MetaMask 钱包连接
- ✅ 账户切换监听
- ✅ 网络切换监听
- ✅ 余额查询

## 安装和运行

### 环境要求
- Node.js ^18.0.0
- npm ^9.0.0 或 yarn ^1.22.0
- MetaMask 浏览器插件

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd zhongcao
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 yarn
   yarn install
   ```

3. **配置环境变量**
   创建 `.env` 文件，根据需要配置以下环境变量：
   ```
   # 测试网 RPC URL
   VITE_RPC_URL=https://testnet-rpc.monad.xyz
   
   # 智能合约地址
   VITE_CONTRACT_ADDRESS=0xFEA6f94BDd7b30F737560ccBb610cA59E1e125C3
   ```

4. **运行开发服务器**
   ```bash
   npm run dev
   # 或使用 yarn
   yarn dev
   ```

5. **构建生产版本**
   ```bash
   npm run build
   # 或使用 yarn
   yarn build
   ```

6. **预览生产构建**
   ```bash
   npm run preview
   # 或使用 yarn
   yarn preview
   ```

## 项目结构

```
src/
├── assets/           # 静态资源文件
├── components/       # 公共组件
│   ├── Header.vue    # 页面头部组件
│   └── Sidebar.vue   # 侧边栏导航组件
├── router/           # 路由配置
│   └── index.js      # 路由定义
├── services/         # 服务层
│   ├── ethereum.js   # 以太坊交互服务
│   ├── ZhongCaoCommunity.sol  # 智能合约源代码
│   └── ZhongCaoCommunity.json  # 智能合约ABI
├── stores/           # Pinia 状态管理
│   └── wallet.js     # 钱包状态管理
├── views/            # 页面组件
│   ├── HomeView.vue      # 首页
│   ├── AdvertiserView.vue # 广告主页面
│   ├── PlanterView.vue    # 种草人页面
│   └── ConsumerView.vue   # 消费者页面
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 主要组件和服务

### 1. 以太坊服务 (ethereum.js)
- 提供与智能合约的交互方法
- 支持读写操作和只读查询
- 实现了完整的业务逻辑，包括任务创建、接取、购买等
- 支持IPFS图片哈希转换为URL

### 2. 钱包状态管理 (wallet.js)
- 管理钱包连接状态
- 监听账户和网络变化
- 提供钱包相关的状态和方法

### 3. 主要页面组件
- **HomeView**: 首页，展示热门任务和种草人排行榜
- **AdvertiserView**: 广告主页面，管理任务和查看统计数据
- **PlanterView**: 种草人页面，接取任务和查看分佣记录
- **ConsumerView**: 消费者页面，查看商品详情和购买商品

## 智能合约集成

### 合约地址
- 测试网地址: `0xFEA6f94BDd7b30F737560ccBb610cA59E1e125C3`

### 主要合约函数

#### 广告主相关
- `createTask`: 创建种草任务
- `addBonusPool`: 补充任务奖金池
- `deactivateTask`: 关闭任务
- `getAdvertiserTasks`: 获取广告主的所有任务

#### 种草人相关
- `acceptTask`: 接取任务
- `getPromoterReferrals`: 获取种草人的推荐列表
- `getPromoterPurchases`: 获取种草人的分佣记录
- `getPromoterLeaderboard`: 获取种草人排行榜

#### 查询相关
- `getTask`: 获取任务详情
- `getReferral`: 获取推荐详情
- `getPurchase`: 获取购买详情
- `getAllTasks`: 获取所有激活的任务

## 钱包连接

1. 确保已安装 MetaMask 浏览器插件
2. 启动应用后，点击右上角的 "连接钱包" 按钮
3. 在 MetaMask 弹窗中确认连接
4. 连接成功后，会显示当前账户地址和余额
5. 支持切换账户和网络

## 开发说明

### 代码规范
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 遵循 ESLint 代码规范
- 组件命名使用 PascalCase
- 函数和变量命名使用 camelCase

### 智能合约开发
- 合约代码位于 `src/services/` 目录
- ABI 文件用于前端与合约交互
- 合约更新后需要重新生成 ABI 文件

### 测试说明
- 目前使用 Monad Testnet 进行测试
- 可以通过 MetaMask 申请测试网 ETH
- 测试任务和购买功能时，建议使用较小的金额

## 功能流程图

```
广告主
  │
  ▼
创建任务 ──┐
  │        │
  ▼        ▼
管理任务  种草人接取任务
             │
             ▼
          生成推荐码
             │
             ▼
          推广商品
             │
             ▼
          消费者购买
             │
             ▼
       智能合约自动分佣
             │
             ▼
       种草人获得佣金
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request，共同改进这个项目。

## 更新日志

### v1.0.0 (2026-01-17)
- 初始化项目
- 实现广告主创建任务功能
- 实现种草人接取任务和推广功能
- 实现消费者购买商品和自动分佣功能
- 集成 MetaMask 钱包连接
- 实现基础的统计和排行榜功能
