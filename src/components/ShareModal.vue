<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuestionStore } from '../stores/questionStore';
import { useAuthStore } from '../stores/authStore';
import { generateShareLink } from '../utils/shareUrl';
import type { Question } from '@solvr/shared';
import { Share2, X, Copy, Check, Layers } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const questionStore = useQuestionStore();
const authStore = useAuthStore();

const title = ref('My SolvR Practice Sheet');
const generatedLink = ref('');
const isCopied = ref(false);
const isGenerating = ref(false);

const totalQuestions = computed(() => questionStore.questions.length);

async function handleGenerate() {
  if (totalQuestions.value === 0) return;
  isGenerating.value = true;
  try {
    const creator =
      authStore.profile?.username ||
      authStore.profile?.display_name ||
      (authStore.user?.email ? authStore.user.email.split('@')[0] : 'SolvR User');

    const link = await generateShareLink(
      questionStore.questions as unknown as Question[],
      title.value,
      creator
    );
    generatedLink.value = link;
  } finally {
    isGenerating.value = false;
  }
}

async function handleCopy() {
  if (!generatedLink.value) return;
  try {
    await navigator.clipboard.writeText(generatedLink.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch {
    // Clipboard permission denied fallback
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      @click="emit('close')"
    />

    <!-- Modal Box -->
    <div
      class="relative z-10 w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl text-white p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Share2 class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Share Practice Sheet</h2>
            <p class="text-xs text-slate-400">Zero-footprint stateless roadmap links</p>
          </div>
        </div>

        <button
          title="Close"
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="py-5 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Roadmap Title
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="e.g. Blind 75 Sprint, NeetCode 150 Core"
            class="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
          <span class="flex items-center gap-2 font-medium">
            <Layers class="w-4 h-4 text-violet-400" />
            Questions to include
          </span>
          <span class="font-bold text-white">{{ totalQuestions }} Problems</span>
        </div>

        <button
          :disabled="isGenerating || totalQuestions === 0"
          class="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
          @click="handleGenerate"
        >
          <Share2 class="w-4 h-4" />
          <span>{{ isGenerating ? 'Compressing...' : 'Generate Shareable Link' }}</span>
        </button>

        <div v-if="generatedLink" class="space-y-2 pt-2 animate-in fade-in duration-150">
          <label class="block text-xs font-semibold text-emerald-400">
            Shareable URL (Compressed with lz-string)
          </label>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="generatedLink"
              class="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300 truncate focus:outline-none"
            />
            <button
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition"
              @click="handleCopy"
            >
              <Check v-if="isCopied" class="w-4 h-4 text-emerald-400" />
              <Copy v-else class="w-4 h-4" />
              <span>{{ isCopied ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
          <p class="text-[11px] text-slate-400">
            Anyone with this link can view this roadmap without overwriting their own questions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
