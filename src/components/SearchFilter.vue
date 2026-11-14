<template>
  <div class="search-filter-bar">
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
import { useQuestionStore } from '../stores/questionStore'
import type { FilterDifficulty, FilterStatus } from '../types'

const store = useQuestionStore()

const handleDifficultyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterDifficulty(target.value as FilterDifficulty)
}

const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  store.setFilterStatus(target.value as FilterStatus)
}
</script>
