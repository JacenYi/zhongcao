<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        <i class="fas fa-leaf"></i>
        Monad种草家
      </router-link>
      
      <div class="nav-tabs">
        <router-link to="/" class="nav-tab" :class="{ active: $route.path === '/' }">
          <i class="fas fa-home"></i>
          <span>任务市场</span>
        </router-link>
        <router-link to="/advertiser" class="nav-tab" :class="{ active: $route.path === '/advertiser' }">
          <i class="fas fa-bullhorn"></i>
          <span>广告主</span>
        </router-link>
        <router-link to="/planter" class="nav-tab" :class="{ active: $route.path === '/planter' }">
          <i class="fas fa-user-friends"></i>
          <span>我的任务</span>
        </router-link>
      </div>
      
      <div class="user-actions">
        <div class="wallet-address" id="walletAddress">{{ isConnected ? walletAddress : '未连接钱包' }}</div>
        <button class="login-btn" id="loginBtn" @click="connectWallet">
          <i class="fas fa-sign-in-alt"></i>
          {{ isConnected ? '断开连接' : '连接钱包' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import walletService from '@/services/wallet.service'
  import { useWalletStore } from '@/store/gameState'
  
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
  
  // 初始化钱包服务
  onMounted(() => {
    walletService.init();
    // 监听钱包连接事件
    walletService.on('connected', handleWalletConnected);
    walletService.on('disconnected', handleWalletDisconnected);
    walletService.on('error', handleWalletError);
    walletService.on('accountChanged', handleAccountChanged);
    
    // 检查现有连接
    const connected = walletService.isWalletConnected();
    if (connected) {
      const account = walletService.getAccount();
      walletStore.setWalletAddress(account);
    }
  });
  
  // 处理钱包连接事件
  const handleWalletConnected = (data) => {
    if (data && data.account) {
      walletService.switchToMonadTestnet();
      walletStore.setWalletAddress(data.account);
    }
  };
  
  // 处理钱包断开连接事件
  const handleWalletDisconnected = () => {
    walletStore.resetWalletState();
  };
  
  // 处理钱包错误事件
  const handleWalletError = (error) => {
    console.error('钱包错误:', error);
  };
  
  // 处理账户变更事件
  const handleAccountChanged = (account) => {
    if (account) {
      walletStore.setWalletAddress(account);
    } else {
      walletStore.resetWalletState();
    }
  };
  
  // 连接钱包
  const connectWallet = async () => {
    try {
      if (isConnected.value) {
        // 如果已经连接，则断开连接
        await walletService.disconnect();
      } else {
        // 如果未连接，则连接钱包
        const result = await walletService.connect();
        if (!result.success) {
          alert('钱包连接失败: ' + result.error);
        }
      }
    } catch (error) {
      alert('钱包操作失败: ' + error.message);
    }
  };
  
  // 清理事件监听器
  onUnmounted(() => {
    walletService.off('connected', handleWalletConnected);
    walletService.off('disconnected', handleWalletDisconnected);
    walletService.off('error', handleWalletError);
    walletService.off('accountChanged', handleAccountChanged);
  });
</script>

<style scoped>
/* 顶部导航栏 */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: var(--white);
    border-bottom: 1px solid var(--gray-border);
    z-index: 1000;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 20px;
}

.logo {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 22px;
    color: var(--primary-red);
    text-decoration: none;
}

.logo i {
    margin-right: 8px;
    font-size: 24px;
}

.nav-tabs {
    display: flex;
    gap: 100px;
}

.nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 14px;
    transition: var(--transition);
    padding: 8px 0;
}

.nav-tab.active {
    color: var(--primary-red);
    font-weight: 500;
}

.nav-tab i {
    font-size: 20px;
    margin-bottom: 4px;
}

.nav-tab:hover {
    color: var(--primary-red);
}

.user-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.login-btn {
    background-color: var(--primary-red);
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
}

.login-btn:hover {
    background-color: var(--dark-red);
}

.wallet-address {
    font-size: 12px;
    color: var(--text-light);
    background-color: var(--gray-bg);
    padding: 4px 10px;
    border-radius: 12px;
    font-family: monospace;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .nav-tabs {
        gap: 15px;
    }
    
    .nav-tab span {
        display: none;
    }
    
    .nav-tab i {
        font-size: 22px;
        margin-bottom: 0;
    }
}
</style>
