<template>
  <div id="app">
    <Navbar />
    <div class="container">
      <div class="main-content">
        <div class="content-section">
          <router-view />
        </div>
        <div class="sidebar">
          <Sidebar />
        </div>
      </div>
    </div>
    <footer class="footer">
      <p>Monad 种草家 - 社交好物裂变分佣平台</p>
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

:root {
    --primary-red: #ff2442;
    --secondary-red: #ff3852;
    --light-red: #fff0f2;
    --dark-red: #e60023;
    --gray-bg: #f8f8f8;
    --gray-border: #efefef;
    --text-primary: #333;
    --text-secondary: #666;
    --text-light: #999;
    --white: #ffffff;
    --shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    --card-radius: 12px;
    --transition: all 0.3s ease;
    --green: #07c160;
    --blue: #1890ff;
}

body {
    background-color: var(--gray-bg);
    color: var(--text-primary);
    line-height: 1.5;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

/* 主内容区 */
.main-content {
    margin-top: 80px;
    display: flex;
    gap: 24px;
    min-height: calc(100vh - 140px);
}

.content-section {
    flex: 3;
}

.sidebar {
    flex: 1;
    min-width: 300px;
}

/* 页脚 */
.footer {
    background-color: white;
    border-top: 1px solid var(--gray-border);
    padding: 30px 0;
    margin-top: 40px;
    text-align: center;
    color: var(--text-light);
    font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 992px) {
    .main-content {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
    }
}
</style>

