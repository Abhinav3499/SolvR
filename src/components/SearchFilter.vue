<template>
  <div class="search-filter-bar">
    <div class="search-wrapper">
      <Search :size="18" class="search-icon" />
      <input
        type="text"
        class="search-input"
        placeholder="Search questions or tags..."
        :value="store.searchQuery"
        @input="handleSearchInput"
      />
      <button 
        v-if="store.searchQuery" 
        class="btn-icon search-clear-btn" 
        title="Clear search"
        @click="store.setSearchQuery('')"
      >
        <X :size="16" />
      </button>
    </div>
    <select 
      class="filter-select"
      :value="store.filterDifficulty"
      @change="handleDifficultyChange"
    >
      <option value="">All Difficulties</option>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
    <select 
      class="filter-select"
      :value="store.filterStatus"
      @change="handleStatusChange"
    >
      <option value="">All Status</option>
      <option value="solved">Solved</option>
      <option value="unsolved">Unsolved</option>
      <option value="starred">Starred</option>
      <option value="revision">Revision</option>
      <option value="due">Due for Review (7+ days)</option>
    </select>
    <select 
      class="filter-select"
      :value="store.filterCompany"
      title="Filter by Target Company"
      @change="handleCompanyChange"
    >
      <option value="">All Companies</option>
      <option value="Google">Google</option>
      <option value="Meta">Meta</option>
      <option value="Amazon">Amazon</option>
      <option value="Microsoft">Microsoft</option>
      <option value="Apple">Apple</option>
      <option value="Uber">Uber</option>
      <option value="Netflix">Netflix</option>
    </select>
    <select 
      class="filter-select"
      :value="store.filterPlatform"
      title="Filter by Platform"
      @change="handlePlatformChange"
    >
      <option value="">All Platforms</option>
      <option value="LeetCode">LeetCode</option>
      <option value="Codeforces">Codeforces</option>
      <option value="HackerRank">HackerRank</option>
      <option value="GeeksforGeeks">GeeksforGeeks</option>
      <option value="CodeChef">CodeChef</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import type { FilterDifficulty, FilterStatus } from '../types'

const store = useQuestionStore()

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  store.setSearchQuery(target.value)
}

const handleCompanyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterCompany(target.value)
}

const handlePlatformChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterPlatform(target.value)
}

const handleDifficultyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterDifficulty(target.value as FilterDifficulty)
}

const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterStatus(target.value as FilterStatus)
}
</script>
