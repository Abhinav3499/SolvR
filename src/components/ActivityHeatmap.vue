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

    <!-- 1-Year Separate Months Grid -->
    <div v-if="isExpanded" class="heatmap-body">
      <div class="grid-scroll-container" ref="scrollContainer">
        <div class="separate-months-wrapper">
          <!-- Day of Week Labels on the Left (Mon, Wed, Fri) -->
          <div class="day-labels-col">
            <div class="day-label-header-space"></div>
            <div class="day-labels-cells">
              <span class="day-name empty-slot"></span>
              <span class="day-name">Mon</span>
              <span class="day-name empty-slot"></span>
              <span class="day-name">Wed</span>
              <span class="day-name empty-slot"></span>
              <span class="day-name">Fri</span>
              <span class="day-name empty-slot"></span>
            </div>
          </div>

          <!-- 12 Separate Month Blocks -->
          <div class="months-strip">
            <div
              v-for="month in monthBlocks"
              :key="month.key"
              class="month-block glass-month"
              :class="{ 'current-month': isCurrentMonth(month) }"
            >
              <!-- Month Title & Monthly Count -->
              <div class="month-block-header">
                <span class="month-name">{{ month.monthName }}</span>
                <span 
                  v-if="month.totalSolved > 0" 
                  class="month-solved-badge"
                  :title="`${month.totalSolved} solved in ${month.label}`"
                >
                  {{ month.totalSolved }}
                </span>
              </div>

              <!-- Month 7-row Week Columns -->
              <div class="month-weeks-grid">
                <div
                  v-for="(week, wIdx) in month.weeks"
                  :key="wIdx"
                  class="month-week-col"
                >
                  <template v-for="(day, dIdx) in week" :key="dIdx">
                    <div
                      v-if="day"
                      class="heatmap-cell"
                      :class="'level-' + day.level"
                      :title="formatTooltip(day)"
                    ></div>
                    <div
                      v-else
                      class="heatmap-cell cell-placeholder"
                    ></div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LeetCode Style Footer Legend -->
      <div class="heatmap-footer">
        <span class="range-info">
          12 individual calendar months (1 year)
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
import { ref, computed, onMounted } from 'vue'
import { Flame, Clock, ChevronDown } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import {
  generateSeparateMonthHeatmaps,
  parseDateKey,
  type MonthBlock,
  type MonthHeatmapDay
} from '../utils/streak'

defineEmits<{
  (e: 'filter-due'): void
}>()

const store = useQuestionStore()
const isExpanded = ref(true)
const scrollContainer = ref<HTMLElement | null>(null)

const streakInfo = computed(() => store.streakInfo)
const dueQuestions = computed(() => store.getDueForReviewQuestions)

// 12 separate month blocks
const heatmapData = computed(() => {
  return generateSeparateMonthHeatmaps(store.activityLog, new Date(), 12)
})

const monthBlocks = computed<MonthBlock[]>(() => heatmapData.value.months)
const totalSolvedPastYear = computed(() => heatmapData.value.totalSolvedPastYear)

const isCurrentMonth = (month: MonthBlock): boolean => {
  const now = new Date()
  return month.year === now.getFullYear() && month.monthName === now.toLocaleString('en-US', { month: 'short' })
}

const formatTooltip = (day: MonthHeatmapDay): string => {
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

onMounted(() => {
  // Auto scroll to current month on small screens
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
  }
})
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

/* LeetCode Separate Months Container */
.heatmap-body {
  padding: 10px 22px 18px;
  border-top: 1px solid var(--glass-border);
}

.grid-scroll-container {
  overflow-x: auto;
  padding-bottom: 8px;
}

.grid-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.grid-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 3px;
}

.separate-months-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 900px;
  width: 100%;
}

/* Day labels column */
.day-labels-col {
  display: flex;
  flex-direction: column;
  width: 28px;
  flex-shrink: 0;
}

.day-label-header-space {
  height: 22px; /* matches .month-block-header height */
  margin-bottom: 6px;
}

.day-labels-cells {
  display: flex;
  flex-direction: column;
  gap: 3px;
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

/* Months Strip: 12 separate month blocks */
.months-strip {
  display: flex;
  gap: 10px;
  flex: 1;
}

/* Individual Month Block */
.month-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 8px 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  transition: all 0.2s ease;
  flex: 1;
}

.month-block:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(6, 182, 212, 0.25);
}

.month-block.current-month {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.035);
}

/* Month Header */
.month-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 3px;
}

.month-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.current-month .month-name {
  color: var(--accent-emerald);
}

.month-solved-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-emerald);
}

/* Weeks grid inside each month */
.month-weeks-grid {
  display: flex;
  gap: 3px;
  justify-content: flex-start;
}

.month-week-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  aspect-ratio: 1;
  border-radius: 2.5px;
  transition: transform 0.12s ease, filter 0.15s ease;
  cursor: pointer;
}

.heatmap-cell:hover:not(.cell-placeholder) {
  transform: scale(1.35);
  z-index: 10;
  filter: brightness(1.2);
}

.cell-placeholder {
  visibility: hidden;
  cursor: default;
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
  margin-top: 14px;
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
