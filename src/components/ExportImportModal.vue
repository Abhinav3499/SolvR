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
        <p class="dropzone-text">Click to choose a SolvR <strong>.json</strong> backup file</p>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json,application/json"
          style="display: none"
          @change="handleFileSelected"
        />
      </div>

      <div v-if="parseError" class="alert-error">
        <AlertCircle :size="18" />
        <span>{{ parseError }}</span>
      </div>

      <div v-if="importedData" class="import-preview">
        <h4>Backup File Detected</h4>
        <div class="preview-stats">
          <span>Topics: <strong>{{ importedData.topics?.length || 0 }}</strong></span>
          <span>Sub-topics: <strong>{{ importedData.subTopics?.length || 0 }}</strong></span>
          <span>Questions: <strong>{{ importedData.questions?.length || 0 }}</strong></span>
        </div>

        <div class="form-group mode-selector">
          <label>Import Mode</label>
          <div class="radio-options">
            <label class="radio-label">
              <input
                v-model="importMode"
                type="radio"
                value="replace"
              />
              <span><strong>Replace</strong> (overwrites current data)</span>
            </label>
            <label class="radio-label">
              <input
                v-model="importMode"
                type="radio"
                value="merge"
              />
              <span><strong>Merge</strong> (combines with existing data)</span>
            </label>
          </div>
        </div>

        <button
          class="btn btn-primary btn-block"
          @click="handleApplyImport"
        >
          Confirm & Restore Data
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
import type { ExportPayload, ImportMode } from '../types'

defineEmits<{
  (e: 'close'): void
}>()

const store = useQuestionStore()

const activeTab = ref<'export' | 'import'>('export')
const copied = ref(false)
const importMode = ref<ImportMode>('replace')
const fileInputRef = ref<HTMLInputElement | null>(null)
const importedData = ref<Partial<ExportPayload> | null>(null)
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
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target?.result as string)
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.topics) || !Array.isArray(parsed.questions)) {
        throw new Error('File does not match expected SolvR backup structure.')
      }
      importedData.value = parsed
    } catch (err: unknown) {
      importedData.value = null
      parseError.value = err instanceof Error ? err.message : 'Invalid JSON file'
    }
  }
  reader.readAsText(file)
}

const handleApplyImport = () => {
  if (!importedData.value) return
  const result = store.importData(importedData.value, importMode.value)
  if (result.success) {
    importSuccess.value = true
    importedData.value = null
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
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent-blue);
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

.summary-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-card h4 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.summary-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-green-light);
}

.stat-label {
  font-size: 0.8rem;
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
  gap: 10px;
  padding: 30px 20px;
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.file-dropzone:hover {
  border-color: var(--accent-blue);
}

.dropzone-icon {
  color: var(--accent-blue);
}

.dropzone-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(248, 81, 73, 0.1);
  color: var(--accent-red);
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(63, 185, 80, 0.1);
  color: var(--accent-green-light);
  font-size: 0.85rem;
  margin-top: 16px;
}

.import-preview {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.preview-stats {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
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
  font-size: 0.85rem;
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
