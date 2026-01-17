<template>
  <div id="planter-page" class="page-section">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-seedling"></i>
          我的种草任务
        </h2>
      </div>
      <div class="card-body">
        <div id="myTasksList">
          <!-- 我的任务将通过Vue动态生成 -->
          <div v-if="isLoadingTasks" class="text-center py-5">
            <div class="spinner-border" style="width: 3rem; height: 3rem; color: var(--primary-red);" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <h4 class="mt-3">正在加载任务...</h4>
          </div>
          <div v-else-if="claimedTasks.length === 0" class="text-center py-5">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--light-red); color: var(--primary-red); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 15px;">
              <i class="fas fa-tasks"></i>
            </div>
            <h4 class="mb-3">暂无任务</h4>
            <p class="text-light mb-4">您还没有领取任何种草任务</p>
            <a href="#" style="margin-top: 20px;" class="btn btn-primary" data-page="task-market" @click="redirectToHome">
              <i class="fas fa-store"></i>
              前往任务市场
            </a>
          </div>
          <div style="max-height: 600px;overflow: auto;" v-else>
            <div v-for="task in claimedTasks" :key="task.id" class="task-card">
              <div class="task-header">
                <div>
                  <h3 class="task-title">{{ task.title }}</h3>
                  <div class="task-advertiser">广告主: {{ task.advertiser }} | 领取时间: {{ task.claimTime }}</div>
                </div>
                <div :class="['badge', task.status === '进行中' ? 'badge-warning' : 'badge-success']">{{ task.status }}</div>
              </div>
              
              <p class="text-secondary mb-3">{{ task.description }}</p>
              
              <div class="task-stats">
                <div class="task-stat">
                  <div class="task-stat-value">{{ task.shares }}</div>
                  <div class="task-stat-label">分享次数</div>
                </div>
                <div class="task-stat">
                  <div class="task-stat-value">{{ task.conversions }}</div>
                  <div class="task-stat-label">转化次数</div>
                </div>
                <div class="task-stat">
                  <div class="task-stat-value">{{ task.earnings }} MON</div>
                  <div class="task-stat-label">累计收益</div>
                </div>
                <div class="task-stat">
                  <div class="task-stat-value">{{ task.commission }} MON</div>
                  <div class="task-stat-label">单笔分佣</div>
                </div>
              </div>
              
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline get-task-link-btn" @click="redirectToConsumer(task.id, task.advertiser, task.refCode)">
                  <i class="fas fa-link"></i>
                  获取专属链接
                </button>
                <!-- <button class="btn btn-primary share-task-btn" :data-id="task.id">
                  <i class="fas fa-share-alt"></i>
                  分享任务
                </button> -->
                <!-- <button class="btn btn-success view-task-stats-btn" :data-id="task.id">
                  <i class="fas fa-chart-line"></i>
                  查看数据
                </button> -->
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="claimedTasks.length > 0" class="text-center mt-4">
          <a href="#" class="btn btn-outline" data-page="task-market" @click="redirectToHome">
            <i class="fas fa-plus"></i>
            领取更多任务
          </a>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-history"></i>
          分佣记录
        </h2>
      </div>
      <div class="card-body">
        <div v-if="isLoadingCommissionRecords" class="text-center py-5">
          <div class="spinner-border" style="width: 3rem; height: 3rem; color: var(--primary-red);" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <h4 class="mt-3">正在加载分佣记录...</h4>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>消费金额</th>
              <th>分佣金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody id="commissionTable">
            <!-- 分佣记录将通过Vue动态生成 -->
            <tr v-if="commissionRecords.length === 0">
              <td colspan="5" class="text-center py-5">
                <h4>暂无分佣记录</h4>
                <p class="text-light">您还没有任何分佣记录</p>
              </td>
            </tr>
            <tr v-else v-for="record in paginatedCommissionRecords" :key="record.id">
              <td>{{ record.time }}</td>
              <td>{{ record.amount }} MON</td>
              <td><strong>{{ record.commission }} MON</strong></td>
              <td>
                <span :class="['badge', record.status === '已结算' ? 'badge-success' : 'badge-warning']">
                  {{ record.status === '已结算' ? '已结算' : '待结算' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="text-center mt-4 page">
          <a-pagination 
            v-model:current="currentPage" 
            :page-size="pageSize" 
            :total="total" 
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useWalletStore } from '@/store/gameState'
import { ethereumService } from '@/services/ethereum'
import { Message } from '@arco-design/web-vue'

const router = useRouter()
const walletStore = useWalletStore()

// 获取钱包状态
const isConnected = ref(walletStore.isConnected)
const walletAddress = ref(walletStore.walletAddress)

// 已领取任务数据
const claimedTasks = ref([])

// 分佣记录数据
const commissionRecords = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 加载状态
const isLoadingTasks = ref(false)
const isLoadingCommissionRecords = ref(false)

// 计算当前页显示的数据
const paginatedCommissionRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return commissionRecords.value.slice(start, end)
})

// 分页变化处理函数
function handlePageChange(page) {
  currentPage.value = page
}

// 重定向到首页
function redirectToHome() {
  router.push({ name: 'home' })
}

// 跳转到消费者页面，携带任务ID、广告主地址和推荐码
function redirectToConsumer(taskId, advertiser, refCode) {
  router.push({ 
    name: 'consumer', 
    query: { 
      id: taskId, 
      advertiser: advertiser,
      refCode: refCode
    } 
  })
}

// 获取已领取任务
const fetchClaimedTasks = async () => {
  if (!isConnected.value || !walletAddress.value) {
    claimedTasks.value = []
    return
  }
  
  try {
    isLoadingTasks.value = true
    // 使用新的getPromoterTaskDetails方法获取种草人的所有任务详情
    const tasks = await ethereumService.getPromoterTaskDetails(walletAddress.value)
    tasks.reverse()
    // 转换为模板需要的格式
    const processedTasks = tasks.map(task => {
      // 计算单笔分佣
      const commission = (parseFloat(task.productPrice) * task.commissionRate / 100).toFixed(1)
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        advertiser: task.advertiser.substring(0, 6) + '...' + task.advertiser.substring(task.advertiser.length - 4),
        claimTime: task.createdAt,
        status: task.isActive ? '进行中' : '已完成',
        shares: task.referralCount,
        conversions: task.purchaseCount,
        refCode: task.refCode,
        earnings: (parseFloat(task.productPrice) * (task.commissionRate / 100) * task.purchaseCount).toFixed(1),
        commission: commission
      }
    })
    
    claimedTasks.value = processedTasks
  } catch (error) {
    console.error('获取已领取任务失败:', error)
    Message.error('获取已领取任务失败，请重试')
    claimedTasks.value = []
  } finally {
    isLoadingTasks.value = false
  }
}

// 获取分佣记录
const fetchCommissionRecords = async () => {
  if (!isConnected.value || !walletAddress.value) {
    commissionRecords.value = []
    total.value = 0
    return
  }
  
  try {
    isLoadingCommissionRecords.value = true
    // 使用新的getPromoterCommissionDetails方法获取种草人的分佣记录
    const records = await ethereumService.getPromoterCommissionDetails(walletAddress.value)
    
    // 转换为模板需要的格式
    const processedRecords = records.map(record => ({
      id: record.id,
      time: record.time,
      amount: record.amount,
      commission: record.commission,
      status: record.status,
    }))
    
    commissionRecords.value = processedRecords
    total.value = processedRecords.length
  } catch (error) {
    console.error('获取分佣记录失败:', error)
    Message.error('获取分佣记录失败，请重试')
    commissionRecords.value = []
    total.value = 0
  } finally {
    isLoadingCommissionRecords.value = false
  }
}

// 当钱包连接状态变化时，重新获取数据
watch(() => [walletStore.isConnected, walletStore.walletAddress], async ([newIsConnected, newWalletAddress]) => {
  isConnected.value = newIsConnected
  walletAddress.value = newWalletAddress
  await fetchClaimedTasks()
  await fetchCommissionRecords()
}, { deep: true })

// 组件挂载时获取数据
onMounted(async () => {
  isConnected.value = walletStore.isConnected
  walletAddress.value = walletStore.walletAddress
  await fetchClaimedTasks()
  await fetchCommissionRecords()
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
    text-decoration: none;
}

.btn-primary {
    background-color: var(--primary-red);
    color: white;
    
}

.btn-primary:hover {
    background-color: var(--dark-red);
}

/* 去除a标签下划线 */
a {
    text-decoration: none;
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

/* 任务卡片 */
.task-card {
    border: 1px solid var(--gray-border);
    border-radius: var(--card-radius);
    padding: 20px;
    margin-bottom: 20px;
    background-color: white;
    transition: var(--transition);
}

.task-card:hover {
    box-shadow: var(--shadow);
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.task-title {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 5px;
}

.task-advertiser {
    color: var(--text-light);
    font-size: 14px;
}

.task-stats {
    display: flex;
    gap: 20px;
    margin-top: 15px;
}

.task-stat {
    text-align: center;
}

.task-stat-value {
    font-weight: 600;
    font-size: 18px;
    color: var(--primary-red);
}

.task-stat-label {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 4px;
}

/* 表格样式 */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    text-align: left;
    padding: 12px 15px;
    border-bottom: 2px solid var(--gray-border);
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
}

.data-table td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--gray-border);
    font-size: 14px;
}

.data-table tr:hover {
    background-color: var(--gray-bg);
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

/* 工具类 */
.text-center {
    text-align: center;
}
.page {
  display: flex;
  justify-content: center;
  align-items: center;
}
.text-secondary {
    color: var(--text-secondary);
}

.text-light {
    color: var(--text-light);
}

.mt-4 {
    margin-top: 20px;
}

.mb-3 {
    margin-bottom: 15px;
}

.py-5 {
    padding-top: 25px;
    padding-bottom: 25px;
}

.d-flex {
    display: flex;
    margin-top: 20px;
}

.gap-2 {
    gap: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .card-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
    
    .task-stats {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .task-header {
        flex-direction: column;
        gap: 10px;
    }
    
    .data-table {
        font-size: 12px;
    }
    
    .data-table th, .data-table td {
        padding: 8px 10px;
    }
}
</style>
