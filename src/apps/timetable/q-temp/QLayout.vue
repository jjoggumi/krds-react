<template>
  <div class="q-layout">
    <!-- 헤더 영역이 존재하면 렌더링 -->
    <header v-if="$slots.header" class="q-layout-header">
      <slot name="header"></slot>
    </header>
    
    <!-- 메인 콘텐츠 영역 (본문) -->
    <main class="q-layout-content">
      <slot></slot>
    </main>
    
    <!-- 푸터 영역이 존재하면 렌더링 -->
    <footer v-if="$slots.footer" class="q-layout-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'QLayout'
}
</script>

<style scoped>
.q-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.q-layout-header,
.q-layout-footer {
  background-color: #f5f5f5;
  padding: 16px;
}

.q-layout-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
