<template>
  <header class="header">
    <div class="header-left">
      <img src="../assets/logo.png" alt="Logo" class="logo" />
      <p>Build consistency. Measure progress. Crack interviews.</p>
    </div>
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        <span>{{ progress.solved }}</span> / {{ progress.total }} solved
      </div>
      <button class="btn btn-icon theme-toggle" @click="toggleTheme" :title="store.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <Sun v-if="store.theme === 'dark'" :size="20" />
        <Moon v-else :size="20" />
      </button>
      <button class="btn btn-primary" @click="$emit('add-topic')">
        <Plus :size="18" />
        Add Topic
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { Plus, Sun, Moon } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'

defineEmits(['add-topic'])

const store = useQuestionStore()
const progress = computed(() => store.overallProgress)
const progressPercentage = computed(() => 
  progress.value.total > 0 
    ? Math.round((progress.value.solved / progress.value.total) * 100) 
    : 0
)

const toggleTheme = () => {
  store.toggleTheme()
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

watch(() => store.theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

onMounted(() => {
  applyTheme(store.theme)
})
</script>

<style scoped>
.logo {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.theme-toggle {
  padding: 8px;
  border-radius: 8px;
  color: var(--accent-yellow);
}

.theme-toggle:hover {
  background: rgba(240, 192, 0, 0.15);
}
</style>
