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

<script setup>
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'

const props = defineProps({
  topicId: {
    type: String,
    required: true
  },
  subTopic: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const store = useQuestionStore()
const isEdit = !!props.subTopic

const formData = ref({
  name: props.subTopic?.name || ''
})

const handleSave = () => {
  if (!formData.value.name.trim()) return

  if (isEdit) {
    store.editSubTopic(props.subTopic.id, formData.value.name.trim())
  } else {
    store.addSubTopic(props.topicId, formData.value.name.trim())
  }
  emit('close')
}
</script>
