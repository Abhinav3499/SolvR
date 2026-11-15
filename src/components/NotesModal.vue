<template>
  <BaseModal 
    title="Notes"
    confirm-text="Save Notes"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <div class="form-group">
      <label class="notes-question-title">{{ question.title }}</label>
      <span class="notes-hint">Write your approach, time/space complexity, edge cases, and insights</span>
      <textarea 
        v-model="notes" 
        placeholder="e.g. Two-pointer approach: start from both ends and move inwards. Time O(N), Space O(1)..."
        rows="7"
      ></textarea>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'
import type { Question } from '../types'

const props = defineProps<{
  question: Question
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useQuestionStore()
const notes = ref(props.question.notes || '')

const handleSave = () => {
  store.updateNotes(props.question.id, notes.value)
  emit('close')
}
</script>

<style scoped>
.notes-question-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.notes-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}
</style>
