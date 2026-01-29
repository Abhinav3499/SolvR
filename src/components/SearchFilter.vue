<template>
  <div class="search-filter-bar">
    <select 
      class="filter-select"
      :value="store.filterDifficulty"
      @change="store.setFilterDifficulty($event.target.value)"
    >
      <option value="">All Difficulties</option>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
    <select 
      class="filter-select"
      :value="store.filterStatus"
      @change="store.setFilterStatus($event.target.value)"
    >
      <option value="">All Status</option>
      <option value="solved">Solved</option>
      <option value="unsolved">Unsolved</option>
      <option value="starred">Starred</option>
      <option value="revision">Revision</option>
    </select>
  </div>
</template>

<script setup>
import { useQuestionStore } from '../stores/questionStore'

const store = useQuestionStore()
</script>
