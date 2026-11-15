<template>
  <div class="heatmap-card glass-card">
    <!-- LeetCode Style Top Stats Bar -->
    <div class="heatmap-header" @click="isExpanded = !isExpanded">
      <div class="header-left-summary">
        <div class="flame-badge" :class="{ active: streakInfo.currentStreak > 0 }">
          <Flame :size="18" />
        </div>
        <div class="summary-text-group">
          <div class="main-stat-line">
            <span class="submissions-count">{{ totalSolvedPastYear }}</span>
            <span class="submissions-label">submissions in the past one year</span>
          </div>
          <div class="streak-sub-strip">
            <span class="sub-stat">Total active days: <strong>{{ streakInfo.totalActiveDays }}d</strong></span>
            <span class="sub-dot">•</span>
            <span class="sub-stat">Max streak: <strong>{{ streakInfo.longestStreak }}d</strong></span>
            <span class="sub-dot">•</span>
            <span class="sub-stat highlight">Current streak: <strong>{{ streakInfo.currentStreak }}d</strong></span>
          </div>
        </div>
      </div>

      <div class="header-right-actions" @click.stop>
        <div 
          v-if="dueQuestions.length > 0" 
          class="due-radar-pill" 
          title="Questions starred or revision due after 7+ days"
          @click="$emit('filter-due')"
        >
          <Clock :size="14" class="icon-rose" />
          <span><strong>{{ dueQuestions.length }}</strong> 7d+ Due</span>
        </div>

        <button 
          class="btn-icon collapse-btn" 
          :title="isExpanded ? 'Collapse Heatmap' : 'Expand Heatmap'"
          @click.stop="isExpanded = !isExpanded"
        >
          <ChevronDown :size="16" class="chevron-icon" :class="{ collapsed: !isExpanded }" />
        </button>
      </div>
    </div>

    <!-- LeetCode 1-Year Month-Wise Grid -->
    <div v-if="isExpanded" class="heatmap-body">
      <div class="grid-scroll-container">
        <div class="leetcode-heatmap-wrapper">
          <!-- Month Labels Header Row -->
          <div class="months-row">
            <div class="day-label-placeholder"></div>
            <div class="months-track">
              <span
                v-for="(m, idx) in monthLabels"
                :key="idx"
                class="month-label"
                :style="{ left: `${(m.weekIndex / totalWeeks) * 100}%` }"
              >
                {{ m.label }}
              </span>
            </div>
          </div>

          <!-- Heatmap Matrix: Day Labels + Week Columns -->
          <div class="heatmap-matrix">
            <!-- Day of Week Labels (Mon, Wed, Fri like LeetCode) -->
            <div class="day-labels-col">
              <span class="day-name empty-slot"></span>
              <span class="day-name">Mon</span>
              <span class="day-name empty-slot"></span>
              <span class="day-name">Wed</span>
              <span class="day-name empty-slot"></span>
              <span class="day-name">Fri</span>
              <span class="day-name empty-slot"></span>
            </div>

            <!-- 53 Week Columns -->
            <div class="weeks-grid">
              <div 
                v-for="weekIdx in totalWeeks" 
                :key="weekIdx" 
                class="week-column"
              >
                <div
                  v-for="day in getWeekDays(weekIdx - 1)"
                  :key="day.date"
                  class="heatmap-cell"
                  :class="'level-' + day.level"
                  :title="formatTooltip(day)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LeetCode Style Footer Legend -->
      <div class="heatmap-footer">
        <span class="range-info">
          1 year submission activity (53 weeks)
        </span>
        <div class="legend">
          <span class="legend-label">Less</span>
          <div class="heatmap-cell level-0" title="0 submissions"></div>
          <div class="heatmap-cell level-1" title="1 submission"></div>
          <div class="heatmap-cell level-2" title="2-3 submissions"></div>
          <div class="heatmap-cell level-3" title="4-6 submissions"></div>
          <div class="heatmap-cell level-4" title="7+ submissions"></div>
          <span class="legend-label">More</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, Clock, ChevronDown } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import { generateHeatmapDays, parseDateKey } from '../utils/streak'
import type { HeatmapDay } from '../types'

defineEmits<{
  (e: 'filter-due'): void
}>()

const store = useQuestionStore()
const isExpanded = ref(true)

const streakInfo = computed(() => store.streakInfo)
const dueQuestions = computed(() => store.getDueForReviewQuestions)

// 1 full year: 53 weeks (~371 days)
const heatmapData = computed(() => {
  return generateHeatmapDays(store.activityLog, 53)
})

const totalWeeks = computed(() => heatmapData.value.totalWeeks)
const monthLabels = computed(() => heatmapData.value.monthLabels)
const totalSolvedPastYear = computed(() => heatmapData.value.totalSolvedPastYear)

const getWeekDays = (weekIndex: number): HeatmapDay[] => {
  return heatmapData.value.days.filter(d => d.weekIndex === weekIndex)
}

const formatTooltip = (day: HeatmapDay): string => {
  const dateObj = parseDateKey(day.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  if (day.count === 0) {
    return `No submissions on ${formattedDate}`
  }
  const submissionWord = day.count === 1 ? 'submission' : 'submissions'
  return `${day.count} ${submissionWord} on ${formattedDate}`
}
</script>

<style scoped>
.heatmap-card {
  background: var(--glass-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
}

.heatmap-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-highlight), transparent);
}

.heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  cursor: pointer;
  user-select: none;
  flex-wrap: wrap;
  gap: 14px;
}

.header-left-summary {
  display: flex;
  align-items: center;
  gap: 14px;
}

.flame-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.flame-badge.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: rgba(249, 115, 22, 0.4);
  color: var(--accent-orange);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.25);
}

.summary-text-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.main-stat-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.submissions-count {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.submissions-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.streak-sub-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.sub-dot {
  opacity: 0.4;
}

.sub-stat strong {
  color: var(--text-primary);
}

.sub-stat.highlight strong {
  color: var(--accent-orange);
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.due-radar-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fb7185;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.due-radar-pill:hover {
  background: rgba(244, 63, 94, 0.22);
  border-color: rgba(244, 63, 94, 0.5);
  transform: translateY(-1px);
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.chevron-icon {
  transition: transform 0.25s ease;
}

.chevron-icon.collapsed {
  transform: rotate(-90deg);
}

/* LeetCode Grid Container */
.heatmap-body {
  padding: 8px 22px 18px;
  border-top: 1px solid var(--glass-border);
}

.grid-scroll-container {
  overflow-x: auto;
  padding-bottom: 6px;
}

.grid-scroll-container::-webkit-scrollbar {
  height: 5px;
}

.grid-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.leetcode-heatmap-wrapper {
  display: inline-flex;
  flex-direction: column;
  min-width: 720px;
  width: 100%;
}

/* Month Labels Row */
.months-row {
  display: flex;
  margin-bottom: 6px;
  height: 18px;
  position: relative;
}

.day-label-placeholder {
  width: 28px;
  flex-shrink: 0;
}

.months-track {
  position: relative;
  flex: 1;
  height: 100%;
}

.month-label {
  position: absolute;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  user-select: none;
  transform: translateX(-2px);
}

/* Heatmap Matrix */
.heatmap-matrix {
  display: flex;
  gap: 6px;
}

.day-labels-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 28px;
  flex-shrink: 0;
}

.day-name {
  height: 12px;
  line-height: 12px;
  font-size: 10px;
  color: var(--text-muted);
  user-select: none;
}

.day-name.empty-slot {
  visibility: hidden;
}

.weeks-grid {
  display: flex;
  gap: 3px;
  flex: 1;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.heatmap-cell {
  width: 100%;
  aspect-ratio: 1;
  min-width: 10px;
  min-height: 10px;
  max-width: 13px;
  max-height: 13px;
  border-radius: 2.5px;
  transition: transform 0.12s ease, filter 0.15s ease;
  cursor: pointer;
}

.heatmap-cell:hover {
  transform: scale(1.35);
  z-index: 10;
  filter: brightness(1.2);
}

/* LeetCode Colors */
.heatmap-cell.level-0 {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

[data-theme="light"] .heatmap-cell.level-0 {
  background: #ebedf0;
  border-color: rgba(0, 0, 0, 0.04);
}

.heatmap-cell.level-1 {
  background: #0e4429;
  box-shadow: 0 0 4px rgba(14, 68, 41, 0.4);
}

[data-theme="light"] .heatmap-cell.level-1 {
  background: #9be9a8;
}

.heatmap-cell.level-2 {
  background: #006d32;
  box-shadow: 0 0 5px rgba(0, 109, 50, 0.5);
}

[data-theme="light"] .heatmap-cell.level-2 {
  background: #40c463;
}

.heatmap-cell.level-3 {
  background: #26a641;
  box-shadow: 0 0 6px rgba(38, 166, 65, 0.6);
}

[data-theme="light"] .heatmap-cell.level-3 {
  background: #30a14e;
}

.heatmap-cell.level-4 {
  background: #39d353;
  box-shadow: 0 0 8px rgba(57, 211, 83, 0.8);
}

[data-theme="light"] .heatmap-cell.level-4 {
  background: #216e39;
}

/* Footer & Legend */
.heatmap-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 10px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend .heatmap-cell {
  width: 11px;
  height: 11px;
}

.legend-label {
  font-size: 11px;
  padding: 0 4px;
  user-select: none;
}
</style>
