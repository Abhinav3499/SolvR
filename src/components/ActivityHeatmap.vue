<template>
  <div class="heatmap-card glass-card">
    <!-- Top Stats Row -->
    <div class="heatmap-header" @click="isExpanded = !isExpanded">
      <div class="heatmap-title-group">
        <Flame :size="20" class="flame-icon" :class="{ active: streakInfo.currentStreak > 0 }" />
        <h3>Daily Consistency & Heatmap</h3>
        <span class="streak-badge">
          {{ streakInfo.currentStreak }} Day Streak
        </span>
      </div>

      <div class="stats-pills" @click.stop>
        <div class="stat-pill" title="Current consecutive days">
          <Flame :size="15" class="icon-orange" />
          <span class="stat-num">{{ streakInfo.currentStreak }}</span>
          <span class="stat-txt">Streak</span>
        </div>

        <div class="stat-pill" title="Longest streak ever">
          <Trophy :size="15" class="icon-yellow" />
          <span class="stat-num">{{ streakInfo.longestStreak }}</span>
          <span class="stat-txt">Best</span>
        </div>

        <div class="stat-pill" title="Total active days">
          <Calendar :size="15" class="icon-blue" />
          <span class="stat-num">{{ streakInfo.totalActiveDays }}</span>
          <span class="stat-txt">Days</span>
        </div>

        <div class="stat-pill" title="Problems solved today">
          <Zap :size="15" class="icon-green" />
          <span class="stat-num">{{ streakInfo.todaySolvedCount }}</span>
          <span class="stat-txt">Today</span>
        </div>

        <div 
          v-if="dueQuestions.length > 0" 
          class="stat-pill due-pill" 
          title="Questions starred or marked for revision that haven't been practiced in 7+ days"
          @click="$emit('filter-due')"
        >
          <Clock :size="15" class="icon-rose" />
          <span class="stat-num">{{ dueQuestions.length }}</span>
          <span class="stat-txt">Due Review</span>
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

    <!-- Collapsible Heatmap Grid -->
    <div v-if="isExpanded" class="heatmap-body">
      <div class="grid-scroll-container">
        <div class="heatmap-matrix">
          <!-- Week Days Labels Column -->
          <div class="day-labels">
            <span class="day-label">Sun</span>
            <span class="day-label">Mon</span>
            <span class="day-label">Tue</span>
            <span class="day-label">Wed</span>
            <span class="day-label">Thu</span>
            <span class="day-label">Fri</span>
            <span class="day-label">Sat</span>
          </div>

          <!-- Weeks Columns -->
          <div class="weeks-container">
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

      <!-- Legend and Range Footer -->
      <div class="heatmap-footer">
        <span class="range-info">
          Activity over the past 26 weeks (6 months)
        </span>
        <div class="legend">
          <span class="legend-label">Less</span>
          <div class="heatmap-cell level-0" title="0 solved"></div>
          <div class="heatmap-cell level-1" title="1 solved"></div>
          <div class="heatmap-cell level-2" title="2-3 solved"></div>
          <div class="heatmap-cell level-3" title="4-6 solved"></div>
          <div class="heatmap-cell level-4" title="7+ solved"></div>
          <span class="legend-label">More</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Flame, Trophy, Calendar, Zap, Clock, ChevronDown } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import { generateHeatmapDays } from '../utils/streak'
import type { HeatmapDay } from '../types'

defineEmits<{
  (e: 'filter-due'): void
}>()

const store = useQuestionStore()
const isExpanded = ref(true)

const streakInfo = computed(() => store.streakInfo)
const dueQuestions = computed(() => store.getDueForReviewQuestions)

const heatmapData = computed(() => {
  return generateHeatmapDays(store.activityLog, 26)
})

const totalWeeks = computed(() => heatmapData.value.totalWeeks)

const getWeekDays = (weekIndex: number): HeatmapDay[] => {
  return heatmapData.value.days.filter(d => d.weekIndex === weekIndex)
}

const formatTooltip = (day: HeatmapDay): string => {
  if (day.count === 0) {
    return `No problems solved on ${day.date}`
  }
  const countText = day.count === 1 ? '1 problem' : `${day.count} problems`
  return `${countText} solved on ${day.date}`
}
</script>

<style scoped>
.heatmap-card {
  background: var(--glass-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 18px;
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
  gap: 12px;
}

.heatmap-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heatmap-title-group h3 {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.flame-icon {
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.flame-icon.active {
  color: var(--accent-orange);
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.6));
  animation: pulseFlame 2s infinite ease-in-out;
}

@keyframes pulseFlame {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

.streak-badge {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--accent-orange);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.stats-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  padding: 5px 12px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.stat-pill:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--glass-border-light);
}

.stat-num {
  font-weight: 700;
  color: var(--text-primary);
}

.stat-txt {
  color: var(--text-secondary);
  font-weight: 500;
}

.due-pill {
  cursor: pointer;
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.3);
}

.due-pill:hover {
  background: rgba(244, 63, 94, 0.2);
  transform: translateY(-1px);
}

.icon-orange { color: #f59e0b; }
.icon-yellow { color: #fbbf24; }
.icon-blue { color: #38bdf8; }
.icon-green { color: #10b981; }
.icon-rose { color: #f43f5e; }

.collapse-btn {
  padding: 6px;
  border-radius: 8px;
}

.chevron-icon {
  transition: transform 0.25s ease;
  color: var(--text-secondary);
}

.chevron-icon.collapsed {
  transform: rotate(-90deg);
}

.heatmap-body {
  padding: 6px 22px 20px 22px;
  border-top: 1px solid var(--glass-border);
}

.grid-scroll-container {
  overflow-x: auto;
  padding: 14px 0 10px 0;
  scrollbar-width: thin;
}

.heatmap-matrix {
  display: flex;
  gap: 8px;
  min-width: 680px;
}

.day-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 6px;
  user-select: none;
}

.day-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  height: 12px;
  line-height: 12px;
}

.day-label:nth-child(even) {
  opacity: 0.35;
}

.weeks-container {
  display: flex;
  gap: 4px;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.heatmap-cell:hover {
  transform: scale(1.35);
  z-index: 10;
  border-color: rgba(255, 255, 255, 0.4);
}

.level-0 {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="light"] .level-0 {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.06);
}

.level-1 {
  background: rgba(16, 185, 129, 0.35);
  border-color: rgba(16, 185, 129, 0.45);
}

.level-2 {
  background: rgba(16, 185, 129, 0.65);
  border-color: rgba(16, 185, 129, 0.75);
}

.level-3 {
  background: #10b981;
  border-color: #34d399;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.level-4 {
  background: #34d399;
  border-color: #6ee7b7;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.8);
}

.heatmap-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 0.78rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 8px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0 2px;
}

@media (max-width: 768px) {
  .heatmap-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-pills {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
