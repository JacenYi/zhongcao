<template>
  <div id="home-page" class="page-section active">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-fire-alt"></i>
          热门种草好物
        </h2>
        <div class="badge badge-info">高佣金回报</div>
      </div>
      <div class="card-body">
        <div style="max-height: 600px;overflow: auto;" class="product-grid" id="hotProducts">
          <!-- 热门商品数据渲染 -->
          <div v-for="product in currentProducts" :key="product.id" class="product-card">
            <img :src="product.image" :alt="product.title" class="product-image">
            <div class="product-info">
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-meta">
                <div>
                  <div class="product-price">{{ product.price }} MON</div>
                  <div style="font-size: 12px; color: var(--text-light); margin-top: 4px;">
                    分佣:{{ product.commission }} MON/单 | 分享: {{ product.shares }}次
                  </div>
                </div>
                <button class="btn btn-primary" @click="openTaskDetailModal(product)">
                  <i class="fas fa-eye"></i>
                  查看任务
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- 分页组件 -->
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
    
    <!-- 最近领取记录卡片 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-history"></i>
          最近领取记录
        </h2>
      </div>
      <div class="card-body">
        <table class="data-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>领取时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="isLogin" id="recentClaimsTable">
            <!-- 最近领取记录数据渲染 -->
            <tr v-for="claim in currentClaims" :key="claim.id">
              <td>{{ claim.taskName }}</td>
              <td>{{ claim.claimTime }}</td>
              <td>
                <span :class="['badge', claim.status === '进行中' ? 'badge-warning' : 'badge-success']">
                  {{ claim.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;" @click="openTaskDetailModal({ id: claim.id, title: claim.taskName, description: claim.description, price: claim.price, image: claim.image, rewardPool: claim.rewardPool }, true)">
                  <i class="fas fa-external-link-alt"></i>
                  查看
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- 领取记录分页组件 -->
        <div class="text-center mt-4 page">
          <a-pagination 
            v-model:current="currentClaimPage" 
            :page-size="claimPageSize" 
            :total="claimTotal" 
            @change="handleClaimPageChange"
          />
        </div>
      </div>
    </div>
    
    <!-- 任务详情模态框 -->
    <div class="modal task-detail-modal" id="taskDetailModal" :class="{ active: showTaskDetailModal }">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">任务详情</h3>
          <button class="modal-close" @click="showTaskDetailModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="task-detail-content">
            <div class="task-detail-image">
              <img :src="selectedProduct.image" :alt="selectedProduct.title">
            </div>
            <div class="task-detail-info">
              <h3 id="detailTaskTitle">{{ selectedProduct.title }}</h3>
              <p id="detailTaskDescription" class="text-light mb-4">{{ selectedProduct.description }}</p>
              
              <div class="detail-section">
                <div class="detail-label">广告主</div>
                <div class="detail-value" id="detailAdvertiser">0x8a3c5e...e1f2e1 (Monad官方)</div>
              </div>
              
              <div class="detail-section">
                <div class="detail-label">商品价格</div>
                <div class="detail-value" id="detailPrice">{{ selectedProduct.price }} MON</div>
              </div>
              
              <div class="detail-section">
                <div class="detail-label">分佣比例</div>
                <div class="detail-value" id="detailCommissionRate">10%</div>
              </div>
              
              <div class="detail-section">
                <div class="detail-label">任务要求</div>
                <div class="detail-value" id="detailRequirements">分享到至少1个社交平台，带来至少3次有效消费</div>
              </div>
              
              <div class="detail-section">
                <div class="detail-label">奖励池余额</div>
                <div class="detail-value" id="detailRewardPool">{{selectedProduct.rewardPool}} MON</div>
              </div>
              
              <div class="detail-commission">
                <div class="commission-value" id="detailCommissionAmount">{{ (selectedProduct.price * 0.1).toFixed(1) }} MON</div>
                <div class="commission-label">每单分佣金额</div>
              </div>
              
              <!-- 仅当不是从最近领取记录打开时显示领取按钮 -->
              <div class="d-flex gap-2 mt-4" v-if="!isFromRecentClaim">
                <button class="btn btn-primary w-100" id="claimTaskBtn" @click="claimTask" :disabled="isClaimingTask">
                  <i v-if="!isClaimingTask" class="fas fa-hand-holding-heart"></i>
                  <i v-else class="fas fa-spinner fa-spin"></i>
                  {{ isClaimingTask ? '领取中...' : '立即领取任务' }}
                </button>
              </div>
              <!-- 当从最近领取记录打开时显示说明 -->
              <div class="text-center mt-4 text-light" v-else>
                <i class="fas fa-info-circle"></i> 该任务已领取，无法重复领取
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ethereumService } from '@/services/ethereum.js'
import { useWalletStore } from '@/store/gameState'
import { Message } from '@arco-design/web-vue'

// 获取钱包状态
const walletStore = useWalletStore()
const isConnected = ref(walletStore.isConnected)
const walletAddress = ref(walletStore.walletAddress)

// 热门商品数据 - 从智能合约获取
const hotProducts = ref([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(4)
const total = ref(0)

// 热门商品加载状态
const isLoadingProducts = ref(false)

// 从智能合约获取热门商品数据
const fetchHotProducts = async () => {
  try {
    // 设置加载状态
    isLoadingProducts.value = true
    
    // 获取所有激活任务的详细信息
    const allTasks = await ethereumService.getAllTaskDetails()
    
    if (!allTasks || !Array.isArray(allTasks)) {
      throw new Error('获取任务数据失败：返回数据格式不正确')
    }
    allTasks.reverse()
    // 计算每个任务的分佣金额并使用实际分享次数
    const processedTasks = allTasks.map(task => {
      // 确保任务数据完整性
      if (!task || typeof task !== 'object') {
        return null
      }
      
      // 计算分佣金额（使用commissionRate百分比）
      const productPrice = parseFloat(task.productPrice) || 0
      const commissionRate = task.commissionRate || 0
      const commission = (productPrice * commissionRate / 100).toFixed(1)
      
      // 使用实际的推荐次数作为分享次数
      const shares = task.referralCount || 0
      
      // 返回商品数据格式，确保与模板期望一致
      return {
        id: task.id,
        title: task.title || '未知任务',
        description: task.description || '暂无描述',
        // 模板中使用product.price，所以保持price属性名
        price: productPrice,
        isActive: task.isActive || false,
        commission: parseFloat(commission),
        shares: shares,
        // 模板中使用product.rewardPool，所以保持rewardPool属性名
        rewardPool: task.bonusPool || '0',
        image: task.coverImageHash || `https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80`
      }
    })
    
    // 过滤掉无效任务和非激活状态的任务
    const activeTasks = processedTasks.filter(task => task !== null && task.isActive)
    hotProducts.value = activeTasks
    total.value = activeTasks.length
    
  } catch (error) {
    console.error('获取热门商品数据失败:', error)
    Message.error('获取热门商品数据失败，请稍后重试')
    // 确保状态正确重置
    hotProducts.value = []
    total.value = 0
  } finally {
    // 重置加载状态
    isLoadingProducts.value = false
  }
}

// 计算当前页显示的产品
const currentProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return hotProducts.value.slice(start, end)
})

// 分页变化事件
const handlePageChange = (page) => {
  currentPage.value = page
}



// 最近领取记录数据 - 从智能合约获取
const recentClaims = ref([])

// 最近领取记录分页数据
const currentClaimPage = ref(1)
const claimPageSize = ref(4)
const claimTotal = ref(0)

// 最近领取记录加载状态
const isLoadingClaims = ref(false)

// 从智能合约获取最近领取记录
const fetchRecentClaims = async () => {
  try {
    // 设置加载状态
    isLoadingClaims.value = true
    // 使用新的getPromoterTaskDetails方法获取种草人的所有任务详情
    const promoterTasks = await ethereumService.getPromoterTaskDetails(walletStore.walletAddress)
    
    // 处理数据，转换为表格需要的格式
    const processedClaims = promoterTasks.map(task => {
      // 计算分佣金额（使用commissionRate百分比）
      const commission = (parseFloat(task.productPrice) * task.commissionRate / 100).toFixed(1)
      
      // 任务状态
      const status = task.isActive ? '进行中' : '已完成'
      
      return {
        id: task.id,
        taskName: task.title,
        description: task.description,
        price: parseFloat(task.productPrice),
        isActive: task.isActive,
        claimTime: task.createdAt,
        status: status,
        commission: parseFloat(commission),
        shares: task.referralCount,
        rewardPool: task.bonusPool,
        image: task.coverImageHash || `https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80`
      }
    })
    
    // 按领取时间倒序排序
    const sortedClaims = processedClaims.sort((a, b) => {
      return new Date(b.claimTime) - new Date(a.claimTime)
    })
    
    recentClaims.value = sortedClaims
    claimTotal.value = sortedClaims.length
  } catch (error) {
    console.error('获取最近领取记录失败:', error)
    Message.error('获取最近领取记录失败，请稍后重试')
    recentClaims.value = []
    claimTotal.value = 0
  } finally {
    // 重置加载状态
    isLoadingClaims.value = false
  }
}

// 在组件挂载时获取数据
onMounted(async () => {
  
})
const isLogin = computed(() => {
  if(walletStore.walletAddress){
    fetchHotProducts()
    fetchRecentClaims()
    
  }
  return walletStore.walletAddress
})
// 计算当前页显示的领取记录
const currentClaims = computed(() => {
  const start = (currentClaimPage.value - 1) * claimPageSize.value
  const end = start + claimPageSize.value
  return recentClaims.value.slice(start, end)
})

// 领取记录分页变化事件
const handleClaimPageChange = (page) => {
  currentClaimPage.value = page
}

// 模态框状态管理
const showTaskDetailModal = ref(false)

// 选中的商品
const selectedProduct = reactive({
  id: 0,
  title: '',
  description: '',
  price: 0,
  image: '',
  rewardPool: 0,
  commissionRate: 0,
})

// 领取任务的加载状态
const isClaimingTask = ref(false)

// 标识模态框是否从最近领取记录打开
const isFromRecentClaim = ref(false)

// 显示任务详情模态框
function openTaskDetailModal(product, fromRecentClaim = false) {
  // 复制商品信息到选中商品
  selectedProduct.id = product.id
  selectedProduct.title = product.title
  selectedProduct.description = product.description
  selectedProduct.price = product.price
  selectedProduct.rewardPool = product.rewardPool
  selectedProduct.image = product.image
  // 设置来源标识
  isFromRecentClaim.value = fromRecentClaim
  // 显示模态框
  showTaskDetailModal.value = true
}

// 领取任务处理函数
const claimTask = async () => {
  try {
    // 设置领取中状态
    isClaimingTask.value = true
    Message.info('正在领取任务...')
    
    // 调用智能合约领取任务
    await ethereumService.acceptTask(selectedProduct.id)
    
    Message.success(`任务领取成功！`)
    
    // 关闭模态框
    showTaskDetailModal.value = false
    
    // 重新获取任务数据
    await fetchHotProducts()
    await fetchRecentClaims()
    
    // 触发全局数据刷新，更新Sidebar等组件
    walletStore.triggerRefresh()
  } catch (error) {
    console.error('领取任务失败:', error)
    // 根据错误类型显示不同的错误信息
    if (error.message.includes('User rejected transaction')) {
      Message.error('用户取消了交易')
    } else if (error.message.includes('Please install MetaMask')) {
      Message.error('请先安装MetaMask钱包')
    } else {
      Message.error('任务领取失败，请检查钱包余额和网络状态后重试')
    }
  } finally {
    // 无论成功失败，都重置领取状态
    isClaimingTask.value = false
  }
}
</script>

<style scoped>

/* 种草卡样式 */
.product-card {
    border-radius: var(--card-radius);
    overflow: hidden;
    background-color: white;
    box-shadow: var(--shadow);
    margin-bottom: 20px;
}

.product-image {
    width: 100%;
    height: 240px;
    object-fit: cover;
}

.product-info {
    padding: 16px;
}

.product-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 8px;
    line-height: 1.4;
}

.product-description {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.5;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}

.product-price {
    font-weight: 600;
    color: var(--primary-red);
    font-size: 18px;
}



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

/* 标签样式 */
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.badge-info {
    background-color: #e8f4ff;
    color: #1890ff;
}

/* 按钮样式 */
.btn {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    font-size: 14px;
}

.btn-primary {
    background-color: var(--primary-red);
    color: white;
}

.btn-primary:hover {
    background-color: var(--dark-red);
}

/* 模态框样式 */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    justify-content: center;
    align-items: center;
}

.modal.active {
    display: flex;
}

.modal-content {
    background-color: white;
    border-radius: var(--card-radius);
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    animation: modalAppear 0.3s ease;
}

.task-detail-modal .modal-content {
    max-width: 800px;
}

@keyframes modalAppear {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--gray-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 20px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-light);
    cursor: pointer;
    line-height: 1;
}

.modal-body {
    padding: 30px 20px;
}

/* 表单样式 */
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
}

.form-input, .form-textarea, .form-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--gray-border);
    border-radius: 8px;
    font-size: 14px;
    transition: var(--transition);
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: var(--primary-red);
    box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

/* 任务详情样式 */
.task-detail-content {
    height: 500px;
    overflow: auto;
}

@media (max-width: 768px) {
    .task-detail-content {
        flex-direction: column;
    }
}

.task-detail-image {
    border-radius: 12px;
    overflow: hidden;
    max-height: 300px;
}

.task-detail-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.task-detail-info {
    margin-top: 20px;
}

.detail-section {
    margin-bottom: 20px;
}

.detail-label {
    font-size: 14px;
    color: var(--text-light);
    margin-bottom: 5px;
}

.detail-value {
    font-size: 16px;
    color: var(--text-primary);
}

.detail-commission {
    background-color: var(--light-red);
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
}

.commission-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-red);
    text-align: center;
}

.commission-label {
    text-align: center;
    color: var(--text-secondary);
    font-size: 14px;
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

/* 按钮样式 */
.btn-outline {
    background-color: transparent;
    border: 1px solid var(--primary-red);
    color: var(--primary-red);
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
}

.btn-outline:hover {
    background-color: var(--light-red);
}

/* 工具类 */
.text-center {
    text-align: center;
}
.page{
    margin-top: 20px;
    display: flex;
    justify-content: center;
}
.text-light {
    color: var(--text-light);
}

.mb-4 {
    margin-bottom: 20px;
}

.w-100 {
    width: 100%;
}

.d-flex {
    display: flex;
}

.gap-2 {
    gap: 10px;
}

.align-center {
    align-items: center;
}
</style>
