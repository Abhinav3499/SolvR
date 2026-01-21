<template>
  <BaseModal 
    :title="isEdit ? 'Edit Question' : 'Add Question'"
    @close="$emit('close')"
    @confirm="handleSave"
  >
    <div class="form-group">
      <label>Question Title *</label>
      <input 
        v-model="formData.title" 
        type="text" 
        placeholder="e.g., Two Sum"
      />
    </div>
    <div class="form-group">
      <label>Problem Link</label>
      <input 
        v-model="formData.link" 
        type="url" 
        placeholder="https://leetcode.com/problems/..."
      />
    </div>
    <div class="form-group">
      <label>Resource Link (Video/Article)</label>
      <input 
        v-model="formData.resource" 
        type="url" 
        placeholder="https://youtube.com/..."
      />
    </div>
    <div class="form-group">
      <label>Difficulty</label>
      <select v-model="formData.difficulty">
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
    </div>
    <div class="form-group">
      <label>Tags (comma separated)</label>
      <input 
        v-model="tagsString" 
        type="text" 
        placeholder="Arrays, Two Pointers, Sorting"
      />
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'

const props = defineProps({
  topicId: {
    type: String,
    required: true
  },
  subTopicId: {
    type: String,
    default: null
  },
  question: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const store = useQuestionStore()
const isEdit = !!props.question

const formData = ref({
  title: props.question?.title || '',
  link: props.question?.link || '',
  resource: props.question?.resource || '',
  difficulty: props.question?.difficulty || 'Medium',
  tags: props.question?.tags || []
})

const tagsString = computed({
  get: () => formData.value.tags.join(', '),
  set: (val) => {
    formData.value.tags = val.split(',').map(t => t.trim()).filter(Boolean)
  }
})

const handleSave = () => {
  if (!formData.value.title.trim()) return

  if (isEdit) {
    store.editQuestion(props.question.id, {
      title: formData.value.title.trim(),
      link: formData.value.link.trim(),
      resource: formData.value.resource.trim(),
      difficulty: formData.value.difficulty,
      tags: formData.value.tags
    })
  } else {
    store.addQuestion(props.topicId, props.subTopicId, {
      title: formData.value.title.trim(),
      link: formData.value.link.trim(),
      resource: formData.value.resource.trim(),
      difficulty: formData.value.difficulty,
      tags: formData.value.tags
    })
  }
  emit('close')
}
</script>
