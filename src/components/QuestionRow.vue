<template>
  <div class="question-row" :class="{ solved: question.isSolved }">
    <!-- Drag Handle -->
    <div class="question-drag-handle">
      <GripVertical :size="16" />
    </div>

    <!-- Solved Checkbox -->
    <div class="checkbox-wrapper">
      <div 
        class="checkbox" 
        :class="{ checked: question.isSolved }"
        @click="store.toggleSolved(question.id)"
      >
        <Check v-if="question.isSolved" :size="14" />
      </div>
    </div>

    <!-- Question Info -->
    <div class="question-info">
      <div class="question-title">
        <a :href="question.link" target="_blank" rel="noopener">
          {{ question.title }}
        </a>
        <span 
          v-if="isDueForReview" 
          class="due-tag" 
          title="Starred or revision question not practiced in 7+ days"
        >
          7d+ Due
        </span>
      </div>
      <div class="question-tags">
        <span v-for="tag in question.tags.slice(0, 3)" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Difficulty -->
    <div 
      class="difficulty-badge" 
      :class="'difficulty-' + question.difficulty.toLowerCase()"
    >
      {{ question.difficulty }}
    </div>

    <!-- Resource Link -->
    <a 
      v-if="question.resource" 
      :href="question.resource" 
      target="_blank" 
      rel="noopener"
      class="resource-link"
    >
      <Youtube :size="18" />
    </a>
    <div v-else></div>

    <!-- Star Button -->
    <button 
      class="action-btn star-btn" 
      :class="{ active: question.isStarred }"
      @click="store.toggleStarred(question.id)"
      title="Star"
    >
      <Star :size="18" :fill="question.isStarred ? 'currentColor' : 'none'" />
    </button>

    <!-- Revision Button -->
    <button 
      class="action-btn revision-btn" 
      :class="{ active: question.isRevision }"
      @click="store.toggleRevision(question.id)"
      title="Mark for revision"
    >
      <RotateCcw :size="18" />
    </button>

    <!-- Notes Button -->
    <button 
      class="action-btn notes-btn" 
      :class="{ 'has-notes': question.notes }"
      @click="$emit('open-notes', question)"
      title="Notes"
    >
      <FileText :size="18" />
    </button>

    <!-- Edit Button -->
    <button 
      class="action-btn edit-btn"
      @click="$emit('edit', question)"
      title="Edit question"
    >
      <Pencil :size="16" />
    </button>

    <!-- Delete Button -->
    <button 
      class="action-btn btn-danger"
      @click="$emit('delete', question)"
      title="Delete question"
    >
      <Trash2 :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Star, RotateCcw, FileText, Youtube, GripVertical, Pencil, Trash2 } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import type { Question } from '../types'

const props = defineProps<{
  question: Question
}>()

defineEmits<{
  (e: 'open-notes', question: Question): void
  (e: 'edit', question: Question): void
  (e: 'delete', question: Question): void
}>()

const store = useQuestionStore()

const isDueForReview = computed(() => {
  if (!props.question.isStarred && !props.question.isRevision) return false
  if (!props.question.lastPracticedAt) return true
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return new Date(props.question.lastPracticedAt).getTime() <= sevenDaysAgo
})
</script>

<style scoped>
.question-drag-handle {
  cursor: grab;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.question-drag-handle:active {
  cursor: grabbing;
}

.due-tag {
  display: inline-block;
  padding: 1px 7px;
  background: rgba(244, 63, 94, 0.15);
  color: var(--accent-red);
  border: 1px solid rgba(244, 63, 94, 0.3);
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
