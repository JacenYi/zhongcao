import { defineStore } from 'pinia'

// 定义钱包状态管理store
export const useWalletStore = defineStore('wallet', {
  state: () => ({
    walletAddress: '',
    currentNetwork: 10143, // 默认Monad Testnet链ID
    isConnected: false,
    refreshSignal: 0 // 用于触发数据刷新的信号，每次需要刷新时递增
  }),
  
  actions: {
    // 设置钱包地址
    setWalletAddress(address) {
      this.walletAddress = address
      this.isConnected = !!address
      // 保存到sessionStorage，刷新后保持连接状态
      if (address) {
        sessionStorage.setItem('walletAddress', address)
      } else {
        sessionStorage.removeItem('walletAddress')
      }
    },
    
    // 设置当前网络
    setCurrentNetwork(chainId) {
      this.currentNetwork = chainId
      // 保存到sessionStorage
      sessionStorage.setItem('currentNetwork', chainId)
    },
    
    // 重置钱包状态
    resetWalletState() {
      this.walletAddress = ''
      this.currentNetwork = 10143
      this.isConnected = false
      sessionStorage.removeItem('walletAddress')
      sessionStorage.removeItem('currentNetwork')
    },
    
    // 初始化钱包状态
    initWalletState() {
      // 从sessionStorage加载钱包地址
      const savedAddress = sessionStorage.getItem('walletAddress')
      if (savedAddress) {
        this.walletAddress = savedAddress
        this.isConnected = true
      }
      
      // 从sessionStorage加载网络信息
      const savedNetwork = sessionStorage.getItem('currentNetwork')
      if (savedNetwork) {
        this.currentNetwork = parseInt(savedNetwork)
      }
    },
    
    // 触发数据刷新
    triggerRefresh() {
      this.refreshSignal++
    }
  }
})

// 旧的导出方式，兼容现有代码
export function setWalletAddress(address) {
  const store = useWalletStore()
  store.setWalletAddress(address)
}

export function setCurrentNetwork(chainId) {
  const store = useWalletStore()
  store.setCurrentNetwork(chainId)
}

export function disconnectWallet() {
  const store = useWalletStore()
  store.resetWalletState()
}

export function resetWalletState() {
  const store = useWalletStore()
  store.resetWalletState()
}

export function getWalletAddress() {
  const store = useWalletStore()
  return store.walletAddress
}

export function checkWalletConnection() {
  const store = useWalletStore()
  return store.isConnected
}

export function initWalletState() {
  const store = useWalletStore()
  store.initWalletState()
}

// 导出状态变量，兼容旧代码
export const walletAddress = {
  get value() {
    const store = useWalletStore()
    return store.walletAddress
  },
  set value(newValue) {
    const store = useWalletStore()
    store.setWalletAddress(newValue)
  }
}

export const isWalletConnected = {
  get value() {
    const store = useWalletStore()
    return store.isConnected
  }
}

export const currentNetwork = {
  get value() {
    const store = useWalletStore()
    return store.currentNetwork
  },
  set value(newValue) {
    const store = useWalletStore()
    store.setCurrentNetwork(newValue)
  }
}
