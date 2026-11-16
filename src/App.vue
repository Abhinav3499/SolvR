<template>
  <div id="app">
    <!-- Header -->
    <HeaderBar
      @add-topic="showTopicModal = true"
      @open-auth="showAuthModal = true"
      @open-social="showSocialModal = true"
      @open-quick-add="showQuickProblemModal = true"
      @open-share="showShareModal = true"
    />

    <!-- LeetCode 1-Year Streak & Activity Heatmap -->
    <ActivityHeatmap
      @filter-due="handleFilterDueReview"
    />

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
      <p>Click "Add Topic" or "Add from LeetCode / CF" to get started with your question tracking</p>
      <div style="display: flex; gap: 12px; margin-top: 16px; justify-content: center;">
        <button class="btn btn-primary" @click="showTopicModal = true">
          <Plus :size="16" />
          Add Topic
        </button>
        <button class="btn btn-secondary" @click="showQuickProblemModal = true">
          <Code2 :size="16" />
          Add from LeetCode / CF
        </button>
      </div>
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

    <QuickProblemModal
      v-if="showQuickProblemModal"
      :initial-url="quickProblemData.url"
      :initial-title="quickProblemData.title"
      :initial-difficulty="quickProblemData.difficulty"
      :initial-platform="quickProblemData.platform"
      @close="showQuickProblemModal = false"
    />

    <ConfirmModal 
      v-if="deleteTarget"
      :item-name="deleteTarget.name"
      :message="getDeleteMessage()"
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />

    <AuthModal
      v-if="showAuthModal"
      @close="showAuthModal = false"
    />

    <SocialModal
      v-if="showSocialModal"
      @close="showSocialModal = false"
    />

    <ShareModal
      v-if="showShareModal"
      @close="showShareModal = false"
    />

    <SharedSheetModal />

    <NotificationDrawer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BookOpen, Plus, Code2 } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { useQuestionStore } from './stores/questionStore'
import type { Topic, SubTopic, Question } from './types'

import HeaderBar from './components/HeaderBar.vue'
import SearchFilter from './components/SearchFilter.vue'
import TopicCard from './components/TopicCard.vue'
import TopicModal from './components/TopicModal.vue'
import SubTopicModal from './components/SubTopicModal.vue'
import QuestionModal from './components/QuestionModal.vue'
import NotesModal from './components/NotesModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import ActivityHeatmap from './components/ActivityHeatmap.vue'
import AuthModal from './components/AuthModal.vue'
import SocialModal from './components/SocialModal.vue'
import QuickProblemModal from './components/QuickProblemModal.vue'
import ShareModal from './components/ShareModal.vue'
import SharedSheetModal from './components/SharedSheetModal.vue'
import NotificationDrawer from './components/NotificationDrawer.vue'
import { useSharedSheetStore } from './stores/sharedSheetStore'
import { parseShareLink } from './utils/shareUrl'

interface DeleteTarget {
  type: 'topic' | 'subtopic' | 'question'
  id: string
  name: string
}

const store = useQuestionStore()
const sharedSheetStore = useSharedSheetStore()

const handleFilterDueReview = () => {
  store.setFilterStatus('due')
}

const showAuthModal = ref(false)
const showSocialModal = ref(false)
const showShareModal = ref(false)
const showQuickProblemModal = ref(false)
const quickProblemData = ref<{
  url?: string
  title?: string
  difficulty?: string
  platform?: string
}>({})

const showTopicModal = ref(false)
const editingTopic = ref<Topic | null>(null)

const showSubTopicModal = ref(false)
const subTopicParentId = ref('')
const editingSubTopic = ref<SubTopic | null>(null)

const showQuestionModal = ref(false)
const questionTopicId = ref('')
const questionSubTopicId = ref<string | null>(null)
const editingQuestion = ref<Question | null>(null)

// Notes Modal State
const notesQuestion = ref<Question | null>(null)

const deleteTarget = ref<DeleteTarget | null>(null)

const filteredQuestionIds = computed<Set<string> | null>(() => {
  const filtered = store.filteredQuestions
  if (
    !store.searchQuery &&
    !store.filterDifficulty &&
    !store.filterStatus &&
    !store.filterCompany &&
    !store.filterPlatform
  ) {
    return null
  }
  return new Set(filtered.map(q => q.id))
})

const sortedTopics = computed<Topic[]>({
  get: () => store.sortedTopics,
  set: (val: Topic[]) => {
    store.reorderTopics(val.map(t => t.id))
  }
})

const openEditTopic = (topic: Topic) => {
  editingTopic.value = topic
  showTopicModal.value = true
}

const closeTopicModal = () => {
  showTopicModal.value = false
  editingTopic.value = null
}

const openDeleteTopic = (topic: Topic) => {
  deleteTarget.value = { type: 'topic', id: topic.id, name: topic.name }
}

const openAddSubTopic = (topic: Topic) => {
  subTopicParentId.value = topic.id
  editingSubTopic.value = null
  showSubTopicModal.value = true
}

const openEditSubTopic = (subTopic: SubTopic) => {
  subTopicParentId.value = subTopic.topicId
  editingSubTopic.value = subTopic
  showSubTopicModal.value = true
}

const closeSubTopicModal = () => {
  showSubTopicModal.value = false
  editingSubTopic.value = null
  subTopicParentId.value = ''
}

const openDeleteSubTopic = (subTopic: SubTopic) => {
  deleteTarget.value = { type: 'subtopic', id: subTopic.id, name: subTopic.name }
}

const openAddQuestion = (topic: Topic, subTopic: SubTopic | null) => {
  questionTopicId.value = topic.id
  questionSubTopicId.value = subTopic?.id || null
  editingQuestion.value = null
  showQuestionModal.value = true
}

const openEditQuestion = (question: Question) => {
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

const openDeleteQuestion = (question: Question) => {
  deleteTarget.value = { type: 'question', id: question.id, name: question.title }
}

const openNotes = (question: Question) => {
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
  if (!deleteTarget.value) return
  if (deleteTarget.value.type === 'topic') {
    store.deleteTopic(deleteTarget.value.id)
  } else if (deleteTarget.value.type === 'subtopic') {
    store.deleteSubTopic(deleteTarget.value.id)
  } else {
    store.deleteQuestion(deleteTarget.value.id)
  }
  deleteTarget.value = null
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('quickAdd') === '1') {
      quickProblemData.value = {
        title: params.get('title') || '',
        url: params.get('link') || '',
        difficulty: params.get('difficulty') || 'Medium',
        platform: params.get('platform') || 'LeetCode'
      }
      showQuickProblemModal.value = true
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }

    if (window.location.hash) {
      const parsed = parseShareLink(window.location.hash)
      if (parsed) {
        sharedSheetStore.openPreview(parsed)
      }
    }
  }
})
</script>
