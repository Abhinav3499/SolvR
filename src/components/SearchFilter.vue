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

const handleDifficultyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterDifficulty(target.value as FilterDifficulty)
}

const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterStatus(target.value as FilterStatus)
}
</script>
