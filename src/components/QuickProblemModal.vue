<template>
  <BaseModal
    title="Add from LeetCode, Codeforces & Web"
    @close="$emit('close')"
  >
    <!-- Mode Tabs -->
    <div class="tabs-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'quick-add' }"
        @click="activeTab = 'quick-add'"
      >
        <Link2 :size="15" />
        Instant URL Importer
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'bookmarklet' }"
        @click="activeTab = 'bookmarklet'"
      >
        <Bookmark :size="15" />
        1-Click Bookmarklet
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'extension' }"
        @click="activeTab = 'extension'"
      >
        <Puzzle :size="15" />
        Browser Extension
      </button>
    </div>

    <!-- Tab 1: Instant URL Importer -->
    <div v-if="activeTab === 'quick-add'" class="tab-pane">
      <div class="form-group">
        <label for="problem-url">Problem URL</label>
        <div class="url-input-wrap">
          <input
            id="problem-url"
            v-model="inputUrl"
            type="url"
            placeholder="Paste LeetCode, Codeforces, GFG, or HackerRank URL..."
            class="input-control"
            @input="handleUrlInput"
          />
          <button
            v-if="inputUrl"
            class="clear-input-btn"
            @click="inputUrl = ''; resetForm()"
          >
            <X :size="14" />
          </button>
        </div>
        <span class="field-hint">
          Supports <code>leetcode.com/problems/...</code>, <code>codeforces.com/...</code>, <code>geeksforgeeks.org/...</code>, <code>hackerrank.com/...</code>
        </span>
      </div>

      <!-- Problem Preview Card -->
      <div class="parsed-preview glass-card">
        <div class="preview-header">
          <div class="preview-badge" :class="detectedPlatform.toLowerCase()">
            <Globe :size="13" />
            <span>{{ detectedPlatform }}</span>
          </div>
          <span class="auto-detected-badge">Auto Detected</span>
        </div>

        <div class="form-group mt-2">
          <label for="parsed-title">Problem Title</label>
          <input
            id="parsed-title"
            v-model="parsedTitle"
            type="text"
            placeholder="e.g. Trapping Rain Water"
            class="input-control"
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label for="target-topic">Target Topic</label>
            <select
              id="target-topic"
              v-model="selectedTopicId"
              class="input-control select-control"
            >
              <option value="" disabled>Select Topic...</option>
              <option v-for="t in store.sortedTopics" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
              <option value="__NEW_TOPIC__">+ Create New Topic...</option>
            </select>
          </div>

          <div v-if="selectedTopicId === '__NEW_TOPIC__'" class="form-group flex-1">
            <label for="new-topic-name">New Topic Name</label>
            <input
              id="new-topic-name"
              v-model="newTopicName"
              type="text"
              placeholder="e.g. Algorithms"
              class="input-control"
            />
          </div>

          <div class="form-group flex-1">
            <label for="parsed-diff">Difficulty</label>
            <select
              id="parsed-diff"
              v-model="selectedDifficulty"
              class="input-control select-control"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="parsed-notes">Notes / Approach (Optional)</label>
          <textarea
            id="parsed-notes"
            v-model="parsedNotes"
            rows="2"
            placeholder="Key insight, time complexity, or edge case..."
            class="input-control textarea-control"
          ></textarea>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner">
        <AlertCircle :size="16" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Tab 2: 1-Click Bookmarklet -->
    <div v-else-if="activeTab === 'bookmarklet'" class="tab-pane">
      <div class="bookmarklet-intro">
        <div class="bookmarklet-icon-wrap">
          <Bookmark :size="24" />
        </div>
        <div>
          <h4>Add with 1 Click from Any Problem Page</h4>
          <p>Drag this button directly to your browser's Bookmarks bar (<code>Ctrl+Shift+B</code> or <code>Cmd+Shift+B</code>):</p>
        </div>
      </div>

      <!-- Draggable Bookmarklet Link -->
      <div class="bookmarklet-box">
        <a
          :href="bookmarkletCode"
          class="bookmarklet-drag-btn"
          title="Drag this button to your Bookmarks Bar"
          @click.prevent="alertDragTip"
        >
          <Plus :size="15" />
          <span>+ Add to SolvR</span>
        </a>
        <span class="drag-hint">← Drag this button up to your Bookmarks Bar</span>
      </div>

      <div class="steps-list">
        <div class="step-row">
          <span class="step-badge">1</span>
          <span>Ensure your Bookmarks Bar is visible (press <code>Ctrl+Shift+B</code>).</span>
        </div>
        <div class="step-row">
          <span class="step-badge">2</span>
          <span>Drag the <strong>+ Add to SolvR</strong> button into your bookmarks bar.</span>
        </div>
        <div class="step-row">
          <span class="step-badge">3</span>
          <span>Whenever you open LeetCode, Codeforces, or HackerRank, click <strong>+ Add to SolvR</strong> to import the problem instantly!</span>
        </div>
      </div>

      <div class="code-copy-row">
        <button class="btn btn-secondary" @click="copyBookmarklet">
          <Copy :size="14" />
          {{ hasCopied ? 'Copied Bookmarklet Code!' : 'Copy Bookmarklet Code' }}
        </button>
      </div>
    </div>

    <!-- Tab 3: Browser Extension -->
    <div v-else class="tab-pane">
      <div class="extension-intro">
        <div class="ext-badge">
          <Puzzle :size="22" />
        </div>
        <div>
          <h4>Chrome, Edge & Brave Extension</h4>
          <p>Injects an interactive floating button directly into LeetCode and Codeforces.</p>
        </div>
      </div>

      <div class="extension-install-guide">
        <div class="guide-card">
          <span class="guide-num">1</span>
          <div>
            <strong>Open Browser Extension Manager</strong>
            <p>Navigate to <code>chrome://extensions</code> or <code>edge://extensions</code>.</p>
          </div>
        </div>

        <div class="guide-card">
          <span class="guide-num">2</span>
          <div>
            <strong>Turn on "Developer Mode"</strong>
            <p>Toggle Developer Mode switch in the top-right corner of the extensions page.</p>
          </div>
        </div>

        <div class="guide-card">
          <span class="guide-num">3</span>
          <div>
            <strong>Click "Load Unpacked"</strong>
            <p>Select the <code>SolvR/extension</code> directory from this repository.</p>
          </div>
        </div>
      </div>

      <div class="ext-features-callout">
        <CheckCircle2 :size="16" class="icon-emerald" />
        <span>A floating <strong>"+ Add to SolvR"</strong> badge will automatically appear whenever you visit any LeetCode or Codeforces problem!</span>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button
        v-if="activeTab === 'quick-add'"
        class="btn btn-primary"
        :disabled="!canSave"
        @click="saveProblem"
      >
        <Plus :size="16" />
        Add to Sheet
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Link2,
  Bookmark,
  Puzzle,
  Globe,
  Plus,
  Copy,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'
import { parseProblemUrl } from '../utils/problemParser'
import type { Difficulty } from '../types'

const props = defineProps<{
  initialUrl?: string
  initialTitle?: string
  initialDifficulty?: string
  initialPlatform?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'added', questionTitle: string): void
}>()

const store = useQuestionStore()

const activeTab = ref<'quick-add' | 'bookmarklet' | 'extension'>('quick-add')
const inputUrl = ref(props.initialUrl || '')
const parsedTitle = ref(props.initialTitle || '')
const selectedDifficulty = ref<Difficulty>((props.initialDifficulty as Difficulty) || 'Medium')
const detectedPlatform = ref<string>(props.initialPlatform || 'LeetCode')
const selectedTopicId = ref<string>('')
const newTopicName = ref('')
const parsedNotes = ref('')
const errorMessage = ref('')
const hasCopied = ref(false)

const canSave = computed(() => {
  if (!parsedTitle.value.trim()) return false
  if (!selectedTopicId.value) return false
  if (selectedTopicId.value === '__NEW_TOPIC__' && !newTopicName.value.trim()) return false
  return true
})

const bookmarkletCode = computed(() => {
  const currentOrigin = window.location.origin
  // Bookmarklet javascript code
  return `javascript:(function(){
    var url = window.location.href;
    var title = document.title;
    var diff = 'Medium';
    var plat = 'Other';
    if(url.includes('leetcode.com/problems/')){
      plat = 'LeetCode';
      var el = document.querySelector('[data-cy="question-title"]') || document.querySelector('div.text-title-large');
      if(el && el.textContent) { title = el.textContent.trim().replace(/^[0-9]+\\.\\s*/, ''); }
      else { title = title.replace(/\\s*-\\s*LeetCode.*$/i, '').replace(/^[0-9]+\\.\\s*/, ''); }
      var text = document.body.innerText;
      if(text.includes('Easy')) diff = 'Easy';
      else if(text.includes('Hard')) diff = 'Hard';
    } else if(url.includes('codeforces.com')){
      plat = 'Codeforces';
      var cfEl = document.querySelector('.problem-statement .title');
      if(cfEl) title = 'CF ' + cfEl.textContent.trim();
      else title = 'CF ' + title.replace(/\\s*-\\s*Codeforces.*$/i, '');
    }
    var target = '${currentOrigin}/?quickAdd=1&title=' + encodeURIComponent(title) + '&link=' + encodeURIComponent(url) + '&difficulty=' + diff + '&platform=' + plat;
    window.open(target, '_blank');
  })();`.replace(/\s+/g, ' ')
})

const handleUrlInput = () => {
  if (!inputUrl.value.trim()) return
  const parsed = parseProblemUrl(inputUrl.value)
  parsedTitle.value = parsed.title
  selectedDifficulty.value = parsed.difficulty
  detectedPlatform.value = parsed.platform
  errorMessage.value = ''
}

const resetForm = () => {
  parsedTitle.value = ''
  selectedDifficulty.value = 'Medium'
  detectedPlatform.value = 'Other'
  errorMessage.value = ''
}

const alertDragTip = () => {
  alert("Tip: Don't click this button here — drag it to your Bookmarks Bar (Ctrl+Shift+B) so you can click it anytime you are on LeetCode or Codeforces!")
}

const copyBookmarklet = async () => {
  try {
    await navigator.clipboard.writeText(bookmarkletCode.value)
    hasCopied.value = true
    setTimeout(() => { hasCopied.value = false }, 3000)
  } catch (err) {
    console.warn('Failed to copy bookmarklet:', err)
  }
}

const saveProblem = () => {
  errorMessage.value = ''
  if (!canSave.value) {
    errorMessage.value = 'Please provide a title and select a topic.'
    return
  }

  let targetTopicId = selectedTopicId.value

  // If user selected create new topic
  if (targetTopicId === '__NEW_TOPIC__') {
    const topic = store.addTopic(newTopicName.value.trim())
    targetTopicId = topic.id
  }

  const tags = [detectedPlatform.value]

  store.addQuestion(targetTopicId, null, {
    title: parsedTitle.value.trim(),
    difficulty: selectedDifficulty.value,
    link: inputUrl.value.trim(),
    resource: '',
    tags,
    notes: parsedNotes.value.trim()
  })

  emit('added', parsedTitle.value.trim())
  emit('close')
}

onMounted(() => {
  // Select first topic by default if available
  if (store.sortedTopics.length > 0) {
    selectedTopicId.value = store.sortedTopics[0].id
  } else {
    selectedTopicId.value = '__NEW_TOPIC__'
    newTopicName.value = 'LeetCode & Practice'
  }

  if (inputUrl.value) {
    handleUrlInput()
  }
})
</script>

<style scoped>
.tabs-nav {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
  margin-bottom: 18px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--glass-bg);
  color: var(--accent-cyan);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 140px;
}

.mt-2 {
  margin-top: 8px;
}

.url-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-control {
  width: 100%;
  padding: 10px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.input-control:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
}

.select-control {
  appearance: none;
  cursor: pointer;
}

.textarea-control {
  resize: vertical;
}

.clear-input-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.field-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.field-hint code {
  color: var(--accent-cyan);
}

.parsed-preview {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 14px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.preview-badge.leetcode {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #fbbf24;
}

.preview-badge.codeforces {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.35);
  color: #60a5fa;
}

.preview-badge.geeksforgeeks {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.preview-badge.hackerrank {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.35);
  color: #c084fc;
}

.auto-detected-badge {
  font-size: 11px;
  color: var(--text-muted);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--accent-red);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
}

/* Bookmarklet view */
.bookmarklet-intro,
.extension-intro {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bookmarklet-icon-wrap,
.ext-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bookmarklet-intro h4,
.extension-intro h4 {
  margin: 0;
  font-size: 15px;
  color: var(--text-primary);
}

.bookmarklet-intro p,
.extension-intro p {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.bookmarklet-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.25);
  border: 2px dashed rgba(6, 182, 212, 0.35);
  border-radius: var(--radius-md);
}

.bookmarklet-drag-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  color: #000;
  font-weight: 700;
  font-size: 13px;
  border-radius: 20px;
  text-decoration: none;
  cursor: grab;
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.drag-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}

.step-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-cyan);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.code-copy-row {
  display: flex;
  justify-content: flex-end;
}

/* Extension Guide */
.extension-install-guide {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.guide-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.2);
  color: var(--accent-cyan);
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-card strong {
  display: block;
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.guide-card p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.guide-card code {
  background: rgba(0, 0, 0, 0.25);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent-cyan);
}

.ext-features-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--accent-emerald);
}

.icon-emerald {
  color: var(--accent-emerald);
}
</style>
