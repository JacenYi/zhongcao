<template>
  <div id="advertiser-page" class="page-section">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-plus-circle"></i>
          创建好物种草卡
        </h2>
      </div>
      <div class="card-body">
        <form id="createProductForm" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">好物名称</label>
            <input type="text" class="form-input" placeholder="例如：Monad限量NFT盲盒" v-model="productName" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">好物描述</label>
            <textarea maxlength="100" class="form-textarea" placeholder="描述你的好物..." rows="3" v-model="productDescription"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">价格 (模拟币)</label>
            <input type="number" class="form-input" v-model.number="price" min="1" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">分佣比例</label>
            <select class="form-select" disabled v-model="commissionRate">
              <option>10% (平台固定)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">奖励池金额 (MON测试币)</label>
            <input type="number" class="form-input" v-model.number="rewardPool" min="1" required>
            <div class="text-light mt-3" style="font-size: 12px;">
              <i class="fas fa-info-circle"></i> 奖励池将用于支付种草家的分佣，请确保有足够余额
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">好物封面图</label>
            <a-upload
              draggable 
              :limit="1"
              :action="uploadUrl"
              :accept="'image/*'"
              :file-list="fileList"
              :auto-upload="false"
              :before-upload="beforeUpload"
              @change="handleFileChange"
              drag
            >
              <div style="padding: 30px 0;">
                <a-icon name="cloud-upload" size="40" style="color: #ccc; margin-bottom: 10px;"></a-icon>
                <p style="color: #999;">点击或拖拽上传图片</p>
                <p style="color: #999; font-size: 12px; margin-top: 8px;">支持 JPG, PNG, GIF 格式，文件大小不超过 5MB</p>
              </div>
            </a-upload>
          </div>
          
          <button type="submit" class="btn btn-primary btn-large w-100" :disabled="isSubmitting">
            <i v-if="!isSubmitting" class="fas fa-check-circle"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ isSubmitting ? '创建中...' : '创建种草卡' }}
          </button>
        </form>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          <i class="fas fa-chart-bar"></i>
          我的推广数据
        </h2>
      </div>
      <div class="card-body">
        <div v-for="(item,index) in promotionData" :key="item.id" :class="['promotion-item', { 'first-item': index === 0 }]">
          <div class="d-flex justify-between align-center mb-4">
            <div>
              <h3>{{ item.name }}</h3>
              <p class="text-light">创建时间: {{ item.createTime }}</p>
            </div>
            <div class="text-right">
              <div :class="['badge', item.status === '推广中' ? 'badge-success' : 'badge-secondary']">{{ item.status }}</div>
              <div class="mt-2">剩余奖励池: <strong>{{ item.remainingRewardPool }} MON</strong></div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div class="text-center">
              <div class="stat-value">{{ item.stats.forwardCount }}</div>
              <div class="stat-label">转发次数</div>
            </div>
            <div class="text-center">
              <div class="stat-value">{{ item.stats.salesCount }}</div>
              <div class="stat-label">消费笔数</div>
            </div>
            <div class="text-center">
              <div class="stat-value">{{ item.stats.commissionAmount }}</div>
              <div class="stat-label">分佣金额(MON)</div>
            </div>
            <div class="text-center">
              <div class="stat-value">{{ item.stats.remainingReward }}</div>
              <div class="stat-label">剩余奖励(MON)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useWalletStore } from '@/store/gameState'
import { ethereumService } from '@/services/ethereum'
// 导入Pinata SDK
import { PinataSDK } from "pinata"

// 获取钱包状态
const walletStore = useWalletStore()
const isConnected = ref(walletStore.isConnected)
const walletAddress = ref(walletStore.walletAddress)

// 表单数据
const productName = ref('')
const productDescription = ref('')
const price = ref(1)
const commissionRate = ref('10% (平台固定)')
const rewardPool = ref(100)

// 推广数据列表
const promotionData = ref([])

// Pinata SDK初始化 - 使用JWT进行身份验证
const pinata = new PinataSDK({
  pinataJwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NjBiMTU5Yy01NzJkLTQ4MmQtYTNjMC04YThkYjAyMWUyNDkiLCJlbWFpbCI6ImxpamlhbjEzNDY3OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOWJhZTRmYTBlYzE0MTA3MWQ0ZjAiLCJzY29wZWRLZXlTZWNyZXQiOiI0Y2IyNDE0NjRmNjBmOThkODVjODA3MDA3NWYyNjg0MGMxZjFmNTAyM2ZiYWRlNTY1YmMwY2RkMGE5OThhMWNjIiwiZXhwIjoxODAwMDgwMjg3fQ.PwGfmq0XLVN2v2_eQv6hwXEeeqXJjJPsmy7RyBqQ5Ao',
  pinataGateway: 'turquoise-defeated-boa-663.mypinata.cloud' // 例如: example-gateway.mypinata.cloud
})

// 上传配置
const uploadUrl = ref('https://example.com/api/upload') // 模拟上传接口
const fileList = ref([])
const uploadedImageHash = ref('')

// 加载状态
const isSubmitting = ref(false)
const isUploadingImage = ref(false)

// 文件上传前检查
const beforeUpload = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    Message.error('文件大小不能超过 5MB')
    return false
  }
  return true
}

// 上传文件到IPFS
const uploadToIPFS = async (file) => {
  try {
    isUploadingImage.value = true
    Message.info('正在上传图片到IPFS...')
    
    // 上传文件到IPFS使用Pinata SDK
    const uploaded = await pinata.upload.public.file(file)
    
    // 获取IPFS哈希
    const ipfsHash = uploaded.cid
    
    // 构建图片URL - 使用Pinata公共网关或自定义网关
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

    Message.success(`图片上传到成功！`)
    
    // 返回IPFS哈希和URL
    return imageUrl
  } catch (error) {
    console.error('上传图片到IPFS失败:', error)
    Message.error('上传图片到IPFS失败，请重试')
    return null
  } finally {
    isUploadingImage.value = false
  }
}

// 获取推广数据
const fetchPromotionData = async () => {
  if (!isConnected.value || !walletAddress.value) {
    promotionData.value = []
    return
  }
  
  try {
    // 使用新的getAdvertiserTaskDetails方法获取广告主的任务详情
    const tasks = await ethereumService.getAdvertiserTaskDetails(walletAddress.value)
    
    // 转换为模板需要的格式
    const processedData = tasks.map(task => {      
      return {
        id: task.id,
        name: task.title,
        createTime: task.createdAt,
        status: task.isActive ? '推广中' : '已结束',
        remainingRewardPool: task.bonusPool,
        stats: {
          forwardCount: task.referralCount, // 使用推荐次数作为转发次数
          salesCount: task.purchaseCount,
          commissionAmount: (parseFloat(task.productPrice) * (task.commissionRate / 100) * task.purchaseCount).toFixed(2),
          remainingReward: task.bonusPool
        }
      }
    })
    
    promotionData.value = processedData
  } catch (error) {
    console.error('获取推广数据失败:', error)
    Message.error('获取推广数据失败，请重试')
  }
}

// 表单提交处理
const handleSubmit = async () => {
  try {
    // 表单验证
    if (!productName.value.trim()) {
      Message.error('请输入好物名称')
      return
    }
    if (!productDescription.value.trim()) {
      Message.error('请输入好物描述')
      return
    }
    if (!price.value || price.value <= 0) {
      Message.error('请输入有效的价格')
      return
    }
    if (!rewardPool.value || rewardPool.value <= 0) {
      Message.error('请输入有效的奖励池金额')
      return
    }
    
    // 检查钱包连接状态
    if (!isConnected.value || !walletAddress.value) {
      Message.error('请先连接钱包')
      return
    }
    
    // 设置提交中状态
    isSubmitting.value = true
    Message.info('正在创建种草卡...')
    
    // 调用智能合约创建任务
    await ethereumService.createTask(
      productName.value,
      productDescription.value,
      price.value.toString(),
      10, // 10% 分佣比例（百分比）
      rewardPool.value.toString(),
      uploadedImageHash.value
    )
    
    Message.success(`种草卡创建成功！`)
    resetForm()
    
    // 重新获取推广数据
    await fetchPromotionData()
  } catch (error) {
    console.error('创建任务失败:', error)
    // 根据错误类型显示不同的错误信息
    if (error.message.includes('User rejected transaction')) {
      Message.error('用户取消了交易')
    } else if (error.message.includes('Please install MetaMask')) {
      Message.error('请先安装MetaMask钱包')
    } else {
      Message.error('种草卡创建失败，请检查钱包余额和网络状态后重试')
    }
  } finally {
    // 无论成功失败，都重置提交状态
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  productName.value = ''
  productDescription.value = ''
  price.value = 1
  commissionRate.value = '10% (平台固定)'
  rewardPool.value = 100
  fileList.value = []
}

// 文件上传变化事件
const handleFileChange = async (fileData) => {
  fileList.value = fileData
  
  // 当有文件被选择时，自动上传到IPFS
  if (fileData.length > 0 && fileData[0].status === 'init') {
    const file = fileData[0].file
    if (file) {
      const ipfsHash = await uploadToIPFS(file)
      if (ipfsHash) {
        uploadedImageHash.value = ipfsHash
        // 打印IPFS地址
        Message.success(`IPFS地址: ${ipfsHash}`)
      }
    }
  }
}

// 当钱包连接状态变化时，重新获取数据
watch(() => [walletStore.isConnected, walletStore.walletAddress], async ([newIsConnected, newWalletAddress]) => {
  isConnected.value = newIsConnected
  walletAddress.value = newWalletAddress
  await fetchPromotionData()
}, { deep: true })

// 组件挂载时获取数据
onMounted(async () => {
  isConnected.value = walletStore.isConnected
  walletAddress.value = walletStore.walletAddress
  await fetchPromotionData()
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
.promotion-item{
  margin-top: 30px;
  padding: 10px 0;
  border-top: 1px solid var(--gray-border);
}
.first-item{
  margin-top: 0;
  border-top: none;
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

/* 统计数据样式 */
.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--primary-red);
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    color: var(--text-secondary);
}

/* 工具类 */
.text-light {
    color: var(--text-light);
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
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
</style>
