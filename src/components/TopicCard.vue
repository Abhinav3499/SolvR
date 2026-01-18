<template>
  <div class="topic-card">
    <!-- Topic Header -->
    <div class="topic-header" @click="isExpanded = !isExpanded">
      <GripVertical :size="18" class="drag-handle" />
      <ChevronRight :size="18" class="chevron" :class="{ expanded: isExpanded }" />
      <span class="topic-title">{{ topic.name }}</span>
      <div class="topic-progress">
        <div class="topic-progress-bar">
          <div 
            class="topic-progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <span>{{ progress.solved }} / {{ progress.total }}</span>
      </div>
      <div class="topic-actions" @click.stop>
        <button class="btn btn-icon" @click="$emit('add-subtopic', topic)" title="Add subtopic">
          <FolderPlus :size="16" />
        </button>
        <button class="btn btn-icon" @click="$emit('add-question', topic, null)" title="Add question">
          <Plus :size="16" />
        </button>
        <button class="btn btn-icon" @click="$emit('edit', topic)" title="Edit topic">
          <Pencil :size="16" />
        </button>
        <button class="btn btn-icon btn-danger" @click="$emit('delete', topic)" title="Delete topic">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <!-- Topic Content -->
    <div v-if="isExpanded" class="topic-content">
      <!-- SubTopics -->
      <draggable
        v-model="sortedSubTopics"
        item-key="id"
        handle=".subtopic-drag-handle"
        :animation="200"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
      >
        <template #item="{ element: subTopic }">
          <div class="subtopic-section">
            <div class="subtopic-header">
              <GripVertical :size="14" class="subtopic-drag-handle" />
              <FolderOpen :size="16" />
              <span class="subtopic-title">{{ subTopic.name }}</span>
              <div class="subtopic-actions" @click.stop>
                <button class="btn btn-icon btn-sm" @click="$emit('add-question', topic, subTopic)" title="Add question">
                  <Plus :size="14" />
                </button>
                <button class="btn btn-icon btn-sm" @click="$emit('edit-subtopic', subTopic)" title="Edit">
                  <Pencil :size="14" />
                </button>
                <button class="btn btn-icon btn-sm btn-danger" @click="$emit('delete-subtopic', subTopic)" title="Delete">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            <!-- Questions in SubTopic -->
            <draggable
              :model-value="getSubTopicQuestions(subTopic.id)"
              @update:model-value="(val) => reorderSubTopicQuestions(subTopic.id, val)"
              item-key="id"
              handle=".question-drag-handle"
              :animation="200"
              ghost-class="sortable-ghost"
            >
              <template #item="{ element: question }">
                <QuestionRow 
                  :question="question" 
                  @open-notes="$emit('open-notes', $event)"
                  @edit="$emit('edit-question', $event)"
                  @delete="$emit('delete-question', $event)"
                />
              </template>
            </draggable>
          </div>
        </template>
      </draggable>

      <!-- Questions without SubTopic -->
      <draggable
        v-model="topLevelQuestions"
        item-key="id"
        handle=".question-drag-handle"
        :animation="200"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
      >
        <template #item="{ element }">
          <QuestionRow 
            :question="element" 
            @open-notes="$emit('open-notes', $event)"
            @edit="$emit('edit-question', $event)"
            @delete="$emit('delete-question', $event)"
          />
        </template>
      </draggable>

      <div v-if="!hasContent" class="empty-state">
        <FileQuestion :size="48" />
        <h3>No questions yet</h3>
        <p>Click "+" to add your first question</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronRight, GripVertical, Pencil, Trash2, Plus, FileQuestion, FolderPlus, FolderOpen } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import QuestionRow from './QuestionRow.vue'
import { useQuestionStore } from '../stores/questionStore'

const props = defineProps({
  topic: {
    type: Object,
    required: true
  },
  filteredQuestionIds: {
    type: Set,
    default: null
  }
})

defineEmits(['edit', 'delete', 'add-question', 'add-subtopic', 'edit-subtopic', 'delete-subtopic', 'open-notes', 'edit-question', 'delete-question'])

const store = useQuestionStore()
const isExpanded = ref(true)

const progress = computed(() => store.getTopicProgress(props.topic.id))
const progressPercentage = computed(() => 
  progress.value.total > 0 
    ? Math.round((progress.value.solved / progress.value.total) * 100) 
    : 0
)

const sortedSubTopics = computed({
  get: () => store.getSubTopicsByTopic(props.topic.id),
  set: (val) => {
    store.reorderSubTopics(props.topic.id, val.map(st => st.id))
  }
})

const getSubTopicQuestions = (subTopicId) => {
  let questions = store.getQuestionsByTopic(props.topic.id, subTopicId)
  if (props.filteredQuestionIds) {
    questions = questions.filter(q => props.filteredQuestionIds.has(q.id))
  }
  return questions
}

const reorderSubTopicQuestions = (subTopicId, newOrder) => {
  store.reorderQuestions(props.topic.id, subTopicId, newOrder.map(q => q.id))
}

const topLevelQuestions = computed({
  get: () => {
    let questions = store.getQuestionsByTopic(props.topic.id, null)
    if (props.filteredQuestionIds) {
      questions = questions.filter(q => props.filteredQuestionIds.has(q.id))
    }
    return questions
  },
  set: (val) => {
    store.reorderQuestions(props.topic.id, null, val.map(q => q.id))
  }
})

const hasContent = computed(() => {
  return topLevelQuestions.value.length > 0 || sortedSubTopics.value.length > 0
})
</script>

<style scoped>
.subtopic-section {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.subtopic-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.subtopic-drag-handle {
  cursor: grab;
  color: var(--text-muted);
}

.subtopic-drag-handle:active {
  cursor: grabbing;
}

.subtopic-title {
  flex: 1;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.subtopic-actions {
  display: flex;
  gap: 2px;
}

.btn-sm {
  padding: 4px;
}
</style>
