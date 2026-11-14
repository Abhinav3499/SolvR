<template>
  <BaseModal 
    :title="isEdit ? 'Edit Sub-Topic' : 'Add Sub-Topic'"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <div class="form-group">
      <label>Sub-Topic Name</label>
      <input 
        v-model="formData.name" 
        type="text" 
        placeholder="e.g., Easy Problems, Hard Problems"
        @keyup.enter="handleSave"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'
import type { SubTopic } from '../types'

const props = defineProps<{
  topicId: string
  subTopic?: SubTopic | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useQuestionStore()
const isEdit = !!props.subTopic

const formData = ref({
  name: props.subTopic?.name || ''
})

const handleSave = () => {
  if (!formData.value.name.trim()) return

  if (isEdit && props.subTopic) {
    store.editSubTopic(props.subTopic.id, formData.value.name.trim())
  } else {
    store.addSubTopic(props.topicId, formData.value.name.trim())
  }
  emit('close')
}
</script>
