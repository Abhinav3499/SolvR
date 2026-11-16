import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DecodedSharedSheetResult } from '../utils/shareUrl';
import { useQuestionStore } from './questionStore';

export const useSharedSheetStore = defineStore('sharedSheet', () => {
  const previewSheet = ref<DecodedSharedSheetResult | null>(null);
  const isOpen = ref(false);

  function openPreview(sheet: DecodedSharedSheetResult) {
    previewSheet.value = sheet;
    isOpen.value = true;
  }

  function closePreview() {
    isOpen.value = false;
  }

  function forkAsNewTopic(): boolean {
    if (!previewSheet.value || previewSheet.value.questions.length === 0) {
      return false;
    }

    const questionStore = useQuestionStore();
    const topicName = previewSheet.value.title || 'Shared Roadmap';
    const newTopic = questionStore.addTopic(topicName);

    for (const q of previewSheet.value.questions) {
      const link =
        q.platform === 'LeetCode'
          ? `https://leetcode.com/problems/${q.id}/`
          : q.platform === 'Codeforces'
          ? `https://codeforces.com/problemset/problem/${q.id}/`
          : '';

      questionStore.addQuestion(newTopic.id, null, {
        title: q.title,
        difficulty: q.difficulty,
        link,
        tags: [q.platform, q.topic].filter(Boolean),
        notes: `Imported from shared sheet by @${previewSheet.value.creatorName}`,
      });
    }

    closePreview();
    return true;
  }

  function mergeIntoTopics(): number {
    if (!previewSheet.value || previewSheet.value.questions.length === 0) {
      return 0;
    }

    const questionStore = useQuestionStore();
    let count = 0;

    for (const q of previewSheet.value.questions) {
      const targetTopicName = q.topic || 'General';
      let existingTopic = questionStore.topics.find(
        (t) => t.name.toLowerCase() === targetTopicName.toLowerCase()
      );

      if (!existingTopic) {
        existingTopic = questionStore.addTopic(targetTopicName);
      }

      // Check for duplicate title
      const isDuplicate = questionStore.questions.some(
        (existingQ) =>
          existingQ.topicId === existingTopic?.id &&
          existingQ.title.toLowerCase() === q.title.toLowerCase()
      );

      if (!isDuplicate) {
        const link =
          q.platform === 'LeetCode'
            ? `https://leetcode.com/problems/${q.id}/`
            : q.platform === 'Codeforces'
            ? `https://codeforces.com/problemset/problem/${q.id}/`
            : '';

        questionStore.addQuestion(existingTopic.id, null, {
          title: q.title,
          difficulty: q.difficulty,
          link,
          tags: [q.platform, q.topic].filter(Boolean),
          notes: `Imported from shared sheet by @${previewSheet.value.creatorName}`,
        });
        count++;
      }
    }

    closePreview();
    return count;
  }

  return {
    previewSheet,
    isOpen,
    openPreview,
    closePreview,
    forkAsNewTopic,
    mergeIntoTopics,
  };
});
