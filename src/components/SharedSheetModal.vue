<script setup lang="ts">
import { computed } from 'vue';
import { useSharedSheetStore } from '../stores/sharedSheetStore';
import { Share2, X, GitFork, Merge, Layers } from 'lucide-vue-next';

const sharedSheetStore = useSharedSheetStore();

const sheet = computed(() => sharedSheetStore.previewSheet);

const difficultyCounts = computed(() => {
  if (!sheet.value) return { easy: 0, medium: 0, hard: 0 };
  return sheet.value.questions.reduce(
    (acc, q) => {
      if (q.difficulty === 'Easy') acc.easy++;
      else if (q.difficulty === 'Medium') acc.medium++;
      else if (q.difficulty === 'Hard') acc.hard++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
});

function handleFork() {
  const success = sharedSheetStore.forkAsNewTopic();
  if (success) {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }
}

function handleMerge() {
  sharedSheetStore.mergeIntoTopics();
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

function handleDismiss() {
  sharedSheetStore.closePreview();
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', window.location.pathname);
  }
}
</script>

<template>
  <div v-if="sharedSheetStore.isOpen && sheet" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      @click="handleDismiss"
    />

    <!-- Modal Box -->
    <div
      class="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Share2 class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Shared Roadmap
              </span>
              <span class="text-xs text-slate-400">
                by @{{ sheet.creatorName }}
              </span>
            </div>
            <h2 class="text-lg font-bold text-white mt-1">{{ sheet.title }}</h2>
          </div>
        </div>

        <button
          title="Close"
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          @click="handleDismiss"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Stats Bar -->
      <div class="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div class="flex items-center gap-4">
          <span class="font-medium text-slate-200 flex items-center gap-1.5">
            <Layers class="w-4 h-4 text-slate-400" />
            {{ sheet.questions.length }} Problems
          </span>
          <span class="text-emerald-400 font-semibold">{{ difficultyCounts.easy }} Easy</span>
          <span class="text-amber-400 font-semibold">{{ difficultyCounts.medium }} Med</span>
          <span class="text-rose-400 font-semibold">{{ difficultyCounts.hard }} Hard</span>
        </div>
        <span class="text-slate-500 text-[11px]">
          Snapshot view (local storage isolated)
        </span>
      </div>

      <!-- Problems List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-2.5">
        <div
          v-for="(q, idx) in sheet.questions"
          :key="idx"
          class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span class="text-xs font-mono text-slate-500 w-5">{{ idx + 1 }}.</span>
            <div class="min-w-0">
              <h4 class="text-sm font-medium text-white truncate">{{ q.title }}</h4>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span class="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">{{ q.platform }}</span>
                <span>{{ q.topic }}</span>
              </div>
            </div>
          </div>

          <span
            class="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            :class="{
              'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20': q.difficulty === 'Easy',
              'text-amber-400 bg-amber-400/10 border border-amber-400/20': q.difficulty === 'Medium',
              'text-rose-400 bg-rose-400/10 border border-rose-400/20': q.difficulty === 'Hard',
            }"
          >
            {{ q.difficulty }}
          </span>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between gap-3">
        <button
          class="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
          @click="handleDismiss"
        >
          Dismiss
        </button>

        <div class="flex items-center gap-2.5">
          <button
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-2 transition"
            @click="handleMerge"
          >
            <Merge class="w-4 h-4 text-indigo-400" />
            <span>Merge with My Sheet</span>
          </button>
          <button
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
            @click="handleFork"
          >
            <GitFork class="w-4 h-4" />
            <span>Save as New Topic</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
