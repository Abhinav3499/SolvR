<template>
  <BaseModal
    title="Data Backup & Restore"
    @close="$emit('close')"
  >
    <!-- Tab Controls -->
    <div class="tabs-nav">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'export' }"
        @click="activeTab = 'export'"
      >
        <Download :size="16" />
        Export
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'import' }"
        @click="activeTab = 'import'"
      >
        <Upload :size="16" />
        Import
      </button>
    </div>

    <!-- Export Tab Content -->
    <div v-if="activeTab === 'export'" class="tab-content">
      <div class="summary-card">
        <h4>Current Data Summary</h4>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-value">{{ store.topics.length }}</span>
            <span class="stat-label">Topics</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.subTopics.length }}</span>
            <span class="stat-label">Sub-topics</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ store.questions.length }}</span>
            <span class="stat-label">Questions</span>
          </div>
        </div>
      </div>

      <p class="export-description">
        Export your complete question sheet to save a local backup or migrate between browsers.
      </p>

      <div class="export-actions">
        <button class="btn btn-secondary action-option" @click="handleExportJSON">
          <FileJson :size="18" />
          <span>Download JSON Backup</span>
        </button>

        <button class="btn btn-secondary action-option" @click="handleExportCSV">
          <FileSpreadsheet :size="18" />
          <span>Export as CSV</span>
        </button>

        <button class="btn btn-secondary action-option" @click="handleCopyJSON">
          <Check v-if="copied" :size="18" class="text-green" />
          <Copy v-else :size="18" />
          <span>{{ copied ? 'JSON Copied to Clipboard!' : 'Copy JSON to Clipboard' }}</span>
        </button>
      </div>
    </div>

    <!-- Import Tab Content -->
    <div v-else class="tab-content">
      <div class="file-dropzone" @click="triggerFileInput">
        <Upload :size="32" class="dropzone-icon" />
        <p class="dropzone-text">Click to choose a SolvR <strong>.json</strong> backup or <strong>.csv</strong> spreadsheet file</p>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,.csv,application/json,text/csv"
          style="display: none"
          @change="handleFileSelected"
        />
      </div>

      <div class="template-helper">
        <span>Want to import from Excel or Google Sheets?</span>
        <button class="btn-link" @click="handleDownloadCSVTemplate">Download Sample CSV Template</button>
      </div>

      <div v-if="parseError" class="alert-error">
        <AlertCircle :size="18" />
        <span>{{ parseError }}</span>
      </div>

      <div v-if="parsedSummary" class="import-preview">
        <h4>File Ready: {{ importedFileName }}</h4>
        <div class="preview-stats">
          <span>Topics: <strong>{{ parsedSummary.topics }}</strong></span>
          <span v-if="parsedSummary.subTopics">Sub-topics: <strong>{{ parsedSummary.subTopics }}</strong></span>
          <span>Questions: <strong>{{ parsedSummary.questions }}</strong></span>
        </div>

        <div class="form-group mode-selector">
          <label>Import Mode</label>
          <div class="radio-options">
            <label class="radio-label">
              <input
                v-model="importMode"
                type="radio"
                value="merge"
              />
              <span><strong>Merge</strong> (combines with existing data — recommended)</span>
            </label>
            <label class="radio-label">
              <input
                v-model="importMode"
                type="radio"
                value="replace"
              />
              <span><strong>Replace</strong> (overwrites current data)</span>
            </label>
          </div>
        </div>

        <button
          class="btn btn-primary btn-block"
          @click="handleApplyImport"
        >
          Confirm & Import Data
        </button>
      </div>

      <div v-if="importSuccess" class="alert-success">
        <Check :size="18" />
        <span>Data successfully imported!</span>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Copy,
  Check,
  AlertCircle
} from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import { useQuestionStore } from '../stores/questionStore'
import { parseCSVToQuestions } from '../utils/csv'
import type { ExportPayload, ImportMode } from '../types'

interface Props {
  initialTab?: 'export' | 'import'
}

const props = withDefaults(defineProps<Props>(), {
  initialTab: 'import'
})

defineEmits<{
  (e: 'close'): void
}>()

const store = useQuestionStore()

const activeTab = ref<'export' | 'import'>(props.initialTab)
const copied = ref(false)
const importMode = ref<ImportMode>('merge')
const fileInputRef = ref<HTMLInputElement | null>(null)

const fileType = ref<'json' | 'csv' | null>(null)
const importedFileName = ref('')
const importedJSONData = ref<Partial<ExportPayload> | null>(null)
const csvRawContent = ref('')
const parsedSummary = ref<{ topics: number; subTopics: number; questions: number } | null>(null)

const parseError = ref('')
const importSuccess = ref(false)

const handleExportJSON = () => {
  const data = store.getExportPayload()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const dateStr = new Date().toISOString().split('T')[0]
  downloadBlob(blob, `solvr-backup-${dateStr}.json`)
}

const handleExportCSV = () => {
  const csv = store.getCSVExport()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const dateStr = new Date().toISOString().split('T')[0]
  downloadBlob(blob, `solvr-questions-${dateStr}.csv`)
}

const handleDownloadCSVTemplate = () => {
  const template = 'Topic,SubTopic,Title,Difficulty,Link,Resource,Tags,Solved,Starred,Revision,Notes\n' +
    'Arrays,Two Pointers,Two Sum,Easy,https://leetcode.com/problems/two-sum/,,,Yes,No,No,"Hash map approach"\n' +
    'Dynamic Programming,,Climbing Stairs,Easy,https://leetcode.com/problems/climbing-stairs/,,,No,Yes,No,""'
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, 'solvr-template.csv')
}

const handleCopyJSON = async () => {
  const data = store.getExportPayload()
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2500)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelected = (e: Event) => {
  parseError.value = ''
  importSuccess.value = false
  parsedSummary.value = null
  importedJSONData.value = null
  csvRawContent.value = ''
  fileType.value = null

  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  importedFileName.value = file.name
  const isCSV = file.name.endsWith('.csv') || file.type.includes('csv')

  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result as string
    if (isCSV) {
      fileType.value = 'csv'
      csvRawContent.value = content
      const { questions, topicsCount, error } = parseCSVToQuestions(content)
      if (error) {
        parseError.value = error
        return
      }
      parsedSummary.value = {
        topics: topicsCount,
        subTopics: 0,
        questions: questions.length
      }
    } else {
      fileType.value = 'json'
      try {
        const parsed = JSON.parse(content)
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.topics) || !Array.isArray(parsed.questions)) {
          throw new Error('File does not match expected SolvR backup structure.')
        }
        importedJSONData.value = parsed
        parsedSummary.value = {
          topics: parsed.topics.length,
          subTopics: parsed.subTopics?.length || 0,
          questions: parsed.questions.length
        }
      } catch (err: unknown) {
        parseError.value = err instanceof Error ? err.message : 'Invalid JSON file'
      }
    }
  }
  reader.readAsText(file)
}

const handleApplyImport = () => {
  let result: { success: boolean; error?: string; count?: number } = { success: false }

  if (fileType.value === 'json' && importedJSONData.value) {
    result = store.importData(importedJSONData.value, importMode.value)
  } else if (fileType.value === 'csv' && csvRawContent.value) {
    result = store.importCSV(csvRawContent.value, importMode.value)
  }

  if (result.success) {
    importSuccess.value = true
    parsedSummary.value = null
    importedJSONData.value = null
    csvRawContent.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  } else {
    parseError.value = result.error || 'Failed to import data'
  }
}
</script>

<style scoped>
.tabs-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: var(--text-primary);
  background: var(--glass-card-hover);
  border-color: var(--glass-border-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.summary-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 18px;
}

.summary-card h4 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent-green-light);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.export-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
}

.file-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 36px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(99, 102, 241, 0.35);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: 14px;
}

.file-dropzone:hover {
  border-color: var(--accent-purple);
  background: rgba(99, 102, 241, 0.06);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -4px rgba(99, 102, 241, 0.2);
}

.dropzone-icon {
  color: var(--accent-purple);
  filter: drop-shadow(0 4px 10px rgba(99, 102, 241, 0.3));
}

.dropzone-text {
  font-size: 0.92rem;
  color: var(--text-secondary);
  text-align: center;
}

.template-helper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 18px;
  padding: 0 4px;
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--accent-blue);
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.82rem;
  font-weight: 500;
}

.btn-link:hover {
  color: var(--text-primary);
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  color: var(--accent-red);
  font-size: 0.88rem;
  margin-bottom: 16px;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: var(--accent-green-light);
  font-size: 0.88rem;
  margin-top: 16px;
}

.import-preview {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 18px;
}

.preview-stats {
  display: flex;
  gap: 16px;
  font-size: 0.88rem;
  margin: 10px 0 16px 0;
  color: var(--text-secondary);
}

.radio-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--text-primary);
  cursor: pointer;
}

.btn-block {
  width: 100%;
  margin-top: 12px;
}

.text-green {
  color: var(--accent-green-light);
}
</style>
