<template>
  <div id="app">
    <!-- Header -->
    <HeaderBar @add-topic="showTopicModal = true" />

    <!-- Search & Filter -->
    <SearchFilter />

    <!-- Topics List -->
    <draggable
      v-model="sortedTopics"
      item-key="id"
      handle=".drag-handle"
      :animation="200"
      ghost-class="sortable-ghost"
      chosen-class="sortable-chosen"
    >
      <template #item="{ element }">
        <TopicCard 
          :topic="element"
          :filtered-question-ids="filteredQuestionIds"
          @edit="openEditTopic"
          @delete="openDeleteTopic"
          @add-question="openAddQuestion"
          @add-subtopic="openAddSubTopic"
          @edit-subtopic="openEditSubTopic"
          @delete-subtopic="openDeleteSubTopic"
          @open-notes="openNotes"
          @edit-question="openEditQuestion"
          @delete-question="openDeleteQuestion"
        />
      </template>
    </draggable>

    <!-- Empty State -->
    <div v-if="!sortedTopics.length" class="empty-state">
      <BookOpen :size="64" />
      <h3>No topics yet</h3>
      <p>Click "Add Topic" to get started with your question tracking</p>
    </div>

    <!-- Modals -->
    <TopicModal 
      v-if="showTopicModal"
      :topic="editingTopic"
      @close="closeTopicModal"
    />

    <SubTopicModal 
      v-if="showSubTopicModal"
      :topic-id="subTopicParentId"
      :sub-topic="editingSubTopic"
      @close="closeSubTopicModal"
    />

    <QuestionModal 
      v-if="showQuestionModal"
      :topic-id="questionTopicId"
      :sub-topic-id="questionSubTopicId"
      :question="editingQuestion"
      @close="closeQuestionModal"
    />

    <NotesModal 
      v-if="notesQuestion"
      :question="notesQuestion"
      @close="notesQuestion = null"
    />

    <ConfirmModal 
      v-if="deleteTarget"
      :item-name="deleteTarget.name"
      :message="getDeleteMessage()"
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BookOpen } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { useQuestionStore } from './stores/questionStore'

import HeaderBar from './components/HeaderBar.vue'
import SearchFilter from './components/SearchFilter.vue'
import TopicCard from './components/TopicCard.vue'
import TopicModal from './components/TopicModal.vue'
import SubTopicModal from './components/SubTopicModal.vue'
import QuestionModal from './components/QuestionModal.vue'
import NotesModal from './components/NotesModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const store = useQuestionStore()

const showTopicModal = ref(false)
const editingTopic = ref(null)

const showSubTopicModal = ref(false)
const subTopicParentId = ref('')
const editingSubTopic = ref(null)

const showQuestionModal = ref(false)
const questionTopicId = ref('')
const questionSubTopicId = ref(null)
const editingQuestion = ref(null)

// Notes Modal State
const notesQuestion = ref(null)

const deleteTarget = ref(null)

const filteredQuestionIds = computed(() => {
  const filtered = store.filteredQuestions
  if (!store.searchQuery && !store.filterDifficulty && !store.filterStatus) {
    return null
  }
  return new Set(filtered.map(q => q.id))
})

const sortedTopics = computed({
  get: () => store.sortedTopics,
  set: (val) => {
    store.reorderTopics(val.map(t => t.id))
  }
})

const openEditTopic = (topic) => {
  editingTopic.value = topic
  showTopicModal.value = true
}

const closeTopicModal = () => {
  showTopicModal.value = false
  editingTopic.value = null
}

const openDeleteTopic = (topic) => {
  deleteTarget.value = { type: 'topic', id: topic.id, name: topic.name }
}

const openAddSubTopic = (topic) => {
  subTopicParentId.value = topic.id
  editingSubTopic.value = null
  showSubTopicModal.value = true
}

const openEditSubTopic = (subTopic) => {
  subTopicParentId.value = subTopic.topicId
  editingSubTopic.value = subTopic
  showSubTopicModal.value = true
}

const closeSubTopicModal = () => {
  showSubTopicModal.value = false
  editingSubTopic.value = null
  subTopicParentId.value = ''
}

const openDeleteSubTopic = (subTopic) => {
  deleteTarget.value = { type: 'subtopic', id: subTopic.id, name: subTopic.name }
}

const openAddQuestion = (topic, subTopic) => {
  questionTopicId.value = topic.id
  questionSubTopicId.value = subTopic?.id || null
  editingQuestion.value = null
  showQuestionModal.value = true
}

const openEditQuestion = (question) => {
  questionTopicId.value = question.topicId
  questionSubTopicId.value = question.subTopicId
  editingQuestion.value = question
  showQuestionModal.value = true
}

const closeQuestionModal = () => {
  showQuestionModal.value = false
  editingQuestion.value = null
  questionTopicId.value = ''
  questionSubTopicId.value = null
}

const openDeleteQuestion = (question) => {
  deleteTarget.value = { type: 'question', id: question.id, name: question.title }
}

const openNotes = (question) => {
  notesQuestion.value = question
}

const getDeleteMessage = () => {
  if (!deleteTarget.value) return ''
  if (deleteTarget.value.type === 'topic') {
    return 'This will delete all sub-topics and questions in this topic.'
  } else if (deleteTarget.value.type === 'subtopic') {
    return 'This will delete all questions in this sub-topic.'
  }
  return ''
}

const confirmDelete = () => {
  if (deleteTarget.value.type === 'topic') {
    store.deleteTopic(deleteTarget.value.id)
  } else if (deleteTarget.value.type === 'subtopic') {
    store.deleteSubTopic(deleteTarget.value.id)
  } else {
    store.deleteQuestion(deleteTarget.value.id)
  }
  deleteTarget.value = null
}
</script>
