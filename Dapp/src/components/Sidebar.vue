<template>
  <div class="sidebar">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-user-circle"></i>
          我的账户
        </h2>
      </div>
      <div class="card-body">
        <div class="text-center mb-4">
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--primary-red); color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 15px;">
            <i class="fas fa-user"></i>
          </div>
          <h3 id="userName">{{ userName }}</h3>
          <div class="wallet-address mt-2" id="sidebarWalletAddress">{{ isConnected ? walletAddress : '未连接钱包' }}</div>
        </div>
        
        <div class="mt-4">
          <h4 class="mb-3">账户概览</h4>
          <div class="d-flex justify-between mb-2">
            <span>累计分佣</span>
            <strong id="totalCommission">{{ totalCommission }}</strong>
          </div>
          <div class="d-flex justify-between">
            <span>进行中任务</span>
            <strong id="activeTasksCount">{{ activeTasksCount }}</strong>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-trophy"></i>
          种草家排行榜
        </h2>
        <span class="text-light" style="font-size: 12px;">本月</span>
      </div>
      <div class="card-body">
        <div class="rank-list" id="rankingList">
          <!-- 种草家排行榜数据渲染 -->
          <div v-for="(ranker, index) in topRankers" :key="ranker.id" class="rank-item">
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="rank-user">
              <div class="rank-name">{{ ranker.name }}</div>
              <div class="rank-address">{{ ranker.address }}</div>
            </div>
            <div class="rank-earnings">{{ ranker.earnings }} MON</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-lightbulb"></i>
          如何成为种草家
        </h2>
      </div>
      <div class="card-body">
        <ol style="padding-left: 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
          <li>登录并连接你的钱包</li>
          <li>前往"任务市场"浏览可领取任务</li>
          <li>选择感兴趣的任务并领取</li>
          <li>获取专属推广链接</li>
          <li>分享链接给朋友或社交平台</li>
          <li>朋友通过链接消费，你获得分佣</li>
          <li>分佣自动结算到你的钱包</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useWalletStore } from '@/store/gameState'
import { ethereumService } from '@/services/ethereum'

const walletStore = useWalletStore()

// 从store获取钱包状态
const rawWalletAddress = computed(() => walletStore.walletAddress)
const isConnected = computed(() => walletStore.isConnected)

// 钱包地址脱敏显示（只显示前6位和后4位）
const walletAddress = computed(() => {
  if (!rawWalletAddress.value) return ''
  if (rawWalletAddress.value.length <= 10) return rawWalletAddress.value
  return `${rawWalletAddress.value.substring(0, 6)}...${rawWalletAddress.value.substring(rawWalletAddress.value.length - 4)}`
})

// 数据状态
const userName = computed(() => isConnected.value ? '种草达人' : '用户昵称')
const totalCommission = ref('0 MON')
const activeTasksCount = ref('0个')
const topRankers = ref([])

// 获取用户数据
const fetchUserData = async () => {
  if (!isConnected.value || !rawWalletAddress.value) {
    totalCommission.value = '0 MON'
    activeTasksCount.value = '0个'
    return
  }
  
  try {
    // 获取用户的所有任务详情
    const tasks = await ethereumService.getPromoterTaskDetails(rawWalletAddress.value)
    
    // 获取进行中任务数量（过滤出active状态为true的任务）
    const activeCount = tasks.filter(task => task.isActive).length
    activeTasksCount.value = `${activeCount}个`
    
    // 计算用户总收益：遍历所有任务，累加佣金金额
    const totalEarnings = tasks.reduce((sum, task) => {
      // 计算每个任务的总佣金：商品价格 * 分佣比例 * 购买数量
      const taskEarnings = parseFloat(task.productPrice) * (task.commissionRate / 100) * task.purchaseCount
      return sum + taskEarnings
    }, 0)
    
    // 格式化总收益，保留两位小数
    const formattedEarnings = totalEarnings.toFixed(2)
    totalCommission.value = `${formattedEarnings} MON`
        
  } catch (error) {
    console.error('获取用户数据失败:', error)
    totalCommission.value = '0 MON'
    activeTasksCount.value = '0个'
  }
}

// 获取种草家排行榜数据
const fetchTopRankers = async () => {
  try {
    const rankers = await ethereumService.getPromoterLeaderboard(5)
    
    // 转换为模板需要的格式
    topRankers.value = rankers.map(ranker => ({
      id: ranker.rank,
      name: `种草家 ${ranker.rank}`,
      address: ranker.address.substring(0, 6) + '...' + ranker.address.substring(ranker.address.length - 4),
      earnings: ranker.formattedEarnings
    }))
  } catch (error) {
    console.error('获取种草家排行榜失败:', error)
    topRankers.value = []
  }
}

// 当钱包连接状态变化时，重新获取数据
watch(isConnected, async () => {
  await fetchUserData()
  await fetchTopRankers()
})

// 当数据刷新信号变化时，重新获取数据
watch(() => walletStore.refreshSignal, async () => {
  await fetchUserData()
  await fetchTopRankers()
})

// 组件挂载时获取数据
onMounted(async () => {
  await fetchUserData()
  await fetchTopRankers()
})
</script>

<style scoped>
/* 卡片样式 */
.card {
    background-color: var(--white);
    border-radius: var(--card-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 20px;
    transition: var(--transition);
}

.card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-weight: 600;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.card-title i {
    color: var(--primary-red);
}

.card-body {
    padding: 20px;
}

/* 按钮样式 */
.btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background-color: var(--primary-red);
    color: white;
}

.btn-primary:hover {
    background-color: var(--dark-red);
}

.btn-outline {
    background-color: transparent;
    border: 1px solid var(--primary-red);
    color: var(--primary-red);
}

.btn-outline:hover {
    background-color: var(--light-red);
}

.btn-success {
    background-color: var(--green);
    color: white;
}

.btn-success:hover {
    background-color: #06ad56;
}

.btn-large {
    padding: 14px 28px;
    font-size: 16px;
}

/* 标签样式 */
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success {
    background-color: #e8f7f0;
    color: #00a76f;
}

.badge-warning {
    background-color: #fff7e8;
    color: #ff9800;
}

.badge-info {
    background-color: #e8f4ff;
    color: #1890ff;
}

.badge-purple {
    background-color: #f3e8ff;
    color: #8b5cf6;
}

/* 种草家排行榜 */
.rank-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.rank-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    background-color: white;
    transition: var(--transition);
}

.rank-item:hover {
    background-color: var(--light-red);
}

.rank-number {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--gray-bg);
    font-weight: 600;
    font-size: 14px;
    margin-right: 12px;
}

.rank-item:nth-child(1) .rank-number {
    background-color: #ffd700;
    color: #333;
}

.rank-item:nth-child(2) .rank-number {
    background-color: #c0c0c0;
    color: #333;
}

.rank-item:nth-child(3) .rank-number {
    background-color: #cd7f32;
    color: #333;
}

.rank-user {
    flex: 1;
}

.rank-name {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
}

.rank-address {
    font-size: 11px;
    color: var(--text-light);
    font-family: monospace;
}

.rank-earnings {
    font-weight: 600;
    color: var(--primary-red);
    font-size: 14px;
}

/* 工具类 */
.text-center {
    text-align: center;
}

.mb-3 {
    margin-bottom: 15px;
}

.mb-4 {
    margin-bottom: 20px;
}

.mt-2 {
    margin-top: 10px;
}

.mt-3 {
    margin-top: 15px;
}

.mt-4 {
    margin-top: 20px;
}

.d-flex {
    display: flex;
}

.align-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.w-100 {
    width: 100%;
}

.gap-2 {
    gap: 10px;
}

.text-light {
    color: var(--text-light);
}
</style>