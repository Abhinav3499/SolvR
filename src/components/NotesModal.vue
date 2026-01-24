<template>
  <BaseModal 
    title="Notes"
    confirm-text="Save Notes"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <div class="form-group">
      <label>{{ question.title }}</label>
      <textarea 
        v-model="notes" 
        placeholder="Add your notes, approach, or important points..."
        rows="6"
      ></textarea>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const store = useQuestionStore()
const notes = ref(props.question.notes || '')

const handleSave = () => {
  store.updateNotes(props.question.id, notes.value)
  emit('close')
}
</script>
