<template>
  <BaseModal 
    :title="isEdit ? 'Edit Topic' : 'Add Topic'"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <div class="form-group">
      <label>Topic Name</label>
      <input 
        v-model="formData.name" 
        type="text" 
        placeholder="e.g., Arrays, Dynamic Programming"
        @keyup.enter="handleSave"
      />
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'

const props = defineProps({
  topic: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const store = useQuestionStore()
const isEdit = !!props.topic

const formData = ref({
  name: props.topic?.name || ''
})

const handleSave = () => {
  if (!formData.value.name.trim()) return

  if (isEdit) {
    store.editTopic(props.topic.id, formData.value.name.trim())
  } else {
    store.addTopic(formData.value.name.trim())
  }
  emit('close')
}
</script>
