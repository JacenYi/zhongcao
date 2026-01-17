<template>
  <div id="consumer-page" class="page-section">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-shopping-bag"></i>
          好物详情
        </h2>
        <div class="badge badge-warning">朋友种草</div>
      </div>
      <div class="card-body">
        <div v-if="isLoadingProduct" class="text-center py-5">
          <div class="spinner-border" style="width: 3rem; height: 3rem; color: var(--primary-red);" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <h4 class="mt-3">正在加载商品详情...</h4>
        </div>
        <div v-else class="product-card">
          <img :src="productDetails.coverImageHash" :alt="productDetails.title" class="product-image">
          <div class="product-info">
            <h3 class="product-title">{{ productDetails.title }}</h3>
            <p class="product-description">{{ productDetails.description }}</p>
            <div class="product-meta">
              <div>
                <div class="product-price">{{ productDetails.price }} MON</div>
                <div style="font-size: 12px; color: var(--text-light); margin-top: 4px;">
                  <span v-if="advertiserFromUrl">
                    推荐人: {{ formatAddress(advertiserFromUrl) }} (好友分享)
                  </span>
                  <span v-else>
                    推荐人: 无
                  </span>
                </div>
              </div>
              <button class="btn btn-primary btn-large" id="buyBtn" @click="handleBuyClick" :disabled="isBuying">
                <i v-if="!isBuying" class="fas fa-shopping-cart"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                {{ isBuying ? '购买中...' : '立即拔草' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h4 class="mb-3">模拟消费</h4>
          <div class="form-group">
            <label class="form-label">消费金额 (MON)</label>
            <input type="number" class="form-input" id="consumptionAmount" v-model.number="consumptionAmount" min="1">
          </div>
          <div class="form-group">
            <label class="form-label">收货地址 (模拟)</label>
            <input type="text" class="form-input" value="上海市浦东新区张江高科技园区">
          </div>
          <button class="btn btn-primary w-100" id="confirmBuyBtn" @click="handleConfirmBuyClick" :disabled="isBuying">
            <i v-if="!isBuying" class="fas fa-check"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ isBuying ? '处理中...' : '确认消费' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-receipt"></i>
          我的消费记录
        </h2>
      </div>
      <div class="card-body">
        <div v-if="isLoadingRecords" class="text-center py-5">
          <div class="spinner-border" style="width: 3rem; height: 3rem; color: var(--primary-red);" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <h4 class="mt-3">正在加载消费记录...</h4>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>商品</th>
              <th>金额</th>
              <th>种草家</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody id="consumptionTable">
            <!-- 消费记录将通过Vue动态生成 -->
            <tr v-if="consumptionRecords.length === 0">
              <td colspan="5" style="text-align: center;" class="text-center py-5">
                <h4>暂无消费记录</h4>
                <p class="text-light">您还没有任何消费记录</p>
              </td>
            </tr>
            <tr v-else v-for="record in consumptionRecords" :key="record.id">
              <td>{{ record.time }}</td>
              <td>{{ record.product }}</td>
              <td>{{ record.amount }} MON</td>
              <td>{{ record.planter }}</td>
              <td>
                <span class="badge badge-success">{{ record.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWalletStore } from '@/store/gameState'
import { ethereumService } from '@/services/ethereum'
import { Message } from '@arco-design/web-vue'

const walletStore = useWalletStore()
const route = useRoute()

// 获取钱包状态
const isConnected = ref(walletStore.isConnected)
const walletAddress = ref(walletStore.walletAddress)

// 从URL query参数中获取推荐码和广告主地址
const refCodeFromUrl = ref(route.query.refCode || '')
const advertiserFromUrl = ref(route.query.advertiser || '')

// 格式化地址，只显示前6位和后4位
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// 商品详情数据
const productDetails = ref({
  id: 1,
  coverImageHash: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
  title: 'Monad限量NFT盲盒',
  description: 'Monad测试网专属限量NFT盲盒，内含稀有Monad主题数字藏品，仅限前1000名用户可获得！',
  price: '99',
  advertiser: '0x0000000000000000000000000000000000000000'
})

// 消费记录数据
const consumptionRecords = ref([])

// 消费金额
const consumptionAmount = ref(99)

// 加载状态
const isLoadingProduct = ref(false)
const isLoadingRecords = ref(false)
const isBuying = ref(false)

// 处理购买按钮点击事件
const handleBuyClick = () => {
  // 直接调用确认购买逻辑
  handleConfirmBuyClick()
};

// 处理确认购买按钮点击事件
const handleConfirmBuyClick = async () => {
  try {
    // 检查钱包连接状态
    if (!isConnected.value || !walletAddress.value) {
      Message.error('请先连接钱包')
      return
    }
    
    // 检查金额有效性
    if (!consumptionAmount.value || consumptionAmount.value <= 0) {
      Message.error('请输入有效的消费金额')
      return
    }
    
    // 设置购买中状态
    isBuying.value = true
    Message.info('正在处理购买...')
    
    // 从URL query参数中获取推荐码，如果没有则使用默认空推荐码
    const refCode = refCodeFromUrl.value || ''
    
    // 调用智能合约购买商品，传递推荐码和商品价格
    const purchaseId = await ethereumService.purchase(
      refCode, // 推荐码
      consumptionAmount.value.toString() // 商品价格（字符串形式）
    )
    
    Message.success(`购买成功！购买ID: ${purchaseId}`)
    
    // 重新获取消费记录
    await fetchConsumptionRecords()
    
    // 触发全局数据刷新，更新Sidebar等组件
    walletStore.triggerRefresh()
  } catch (error) {
    console.error('购买失败:', error)
    // 根据错误类型显示不同的错误信息
    if (error.message.includes('User rejected transaction')) {
      Message.error('用户取消了交易')
    } else if (error.message.includes('Please install MetaMask')) {
      Message.error('请先安装MetaMask钱包')
    } else if (error.message.includes('Invalid referral code')) {
      Message.error('无效的推荐码')
    } else if (error.message.includes('Task is not active')) {
      Message.error('任务已关闭或未激活')
    } else if (error.message.includes('Incorrect payment amount')) {
      Message.error('发送的金额与商品价格不匹配')
    } else if (error.message.includes('Insufficient bonus pool')) {
      Message.error('任务奖金池余额不足')
    } else {
      Message.error('购买失败，请检查钱包余额和网络状态后重试')
    }
  } finally {
    // 无论成功失败，都重置购买状态
    isBuying.value = false
  }
};

// 获取商品详情
const fetchProductDetails = async (taskId = 1) => {
  try {
    isLoadingProduct.value = true
    const details = await ethereumService.getTask(taskId)
    
    // 转换为模板需要的格式
    productDetails.value = {
      ...details,
      price: details.productPrice // 确保有price字段，与原模板兼容
    }
    // 更新消费金额为商品价格
    consumptionAmount.value = parseFloat(details.productPrice)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    Message.error('获取商品详情失败，请重试')
  } finally {
    isLoadingProduct.value = false
  }
}

// 获取消费记录
const fetchConsumptionRecords = async () => {
  if (!isConnected.value || !walletAddress.value) {
    consumptionRecords.value = []
    return
  }
  
  try {
    isLoadingRecords.value = true
    const records = await ethereumService.getUserConsumptionDetails(walletAddress.value)
    
    // 转换为模板需要的格式
    consumptionRecords.value = records.map(record => ({
      id: record.id,
      time: record.time,
      product: record.productName, // 将productName转换为product
      amount: record.amount,
      planter: formatAddress(record.advertiser), // 将advertiser转换为planter，并格式化地址
      status: record.status
    }))
  } catch (error) {
    console.error('获取消费记录失败:', error)
    Message.error('获取消费记录失败，请重试')
    consumptionRecords.value = []
  } finally {
    isLoadingRecords.value = false
  }
}

// 当钱包连接状态变化时，重新获取数据
watch(() => [walletStore.isConnected, walletStore.walletAddress], async ([newIsConnected, newWalletAddress]) => {
  isConnected.value = newIsConnected
  walletAddress.value = newWalletAddress
  await fetchConsumptionRecords()
}, { deep: true })

// 组件挂载时获取数据
onMounted(async () => {
  isConnected.value = walletStore.isConnected
  walletAddress.value = walletStore.walletAddress
  
  // 从URL query参数中获取id，如果有则获取对应商品详情
  const taskIdFromUrl = route.query.id
  if (taskIdFromUrl) {
    await fetchProductDetails(parseInt(taskIdFromUrl))
  } else {
    await fetchProductDetails()
  }
  
  await fetchConsumptionRecords()
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

/* 标签样式 */
.badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.badge-warning {
    background-color: #fff7e8;
    color: #ff9800;
}

.badge-success {
    background-color: #e8f7f0;
    color: #00a76f;
}

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
    height: 300px;
    object-fit: cover;
}

.product-info {
    padding: 20px;
}

.product-title {
    font-weight: 600;
    font-size: 24px;
    margin-bottom: 12px;
    line-height: 1.4;
}

.product-description {
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--gray-border);
}

.product-price {
    font-weight: 600;
    color: var(--primary-red);
    font-size: 28px;
    margin-bottom: 8px;
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

.form-textarea {
    min-height: 100px;
    resize: vertical;
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
    justify-content: center;
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

.btn-large {
    padding: 14px 28px;
    font-size: 16px;
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

/* 工具类 */
.mt-4 {
    margin-top: 20px;
}

.mb-3 {
    margin-bottom: 15px;
}

.w-100 {
    width: 100%;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .product-meta {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
    }
    
    .product-title {
        font-size: 20px;
    }
    
    .product-image {
        height: 200px;
    }
}
</style>