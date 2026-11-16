// SolvR Main World Fetch Hook for LeetCode GraphQL
(function () {
  if (window.__solvr_interceptor_loaded) return;
  window.__solvr_interceptor_loaded = true;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      if (url.includes('/graphql') || url.includes('/graphql/')) {
        const clonedResponse = response.clone();
        clonedResponse.json().then((data) => {
          if (data?.data?.question) {
            const q = data.data.question;
            const detail = {
              platform: 'LeetCode',
              id: q.questionFrontendId || q.questionId,
              title: q.title || q.questionTitle,
              slug: q.titleSlug,
              difficulty: q.difficulty || 'Medium',
              tags: q.topicTags?.map((t) => t.name) || [],
              url: window.location.href,
            };

            window.dispatchEvent(
              new CustomEvent('solvr:problem_detected', { detail })
            );
          }
        }).catch(() => {
          // Ignore JSON parsing failures for non-JSON GraphQL streams
        });
      }
    } catch {
      // Never interfere with original fetch execution
    }

    return response;
  };
})();
