// SolvR Browser Content Script with Network Interception & In-Page Toast
(function () {
  const DEFAULT_SOLVR_URL = 'https://question-tracker-khaki.vercel.app';
  let detectedProblem = null;
  let toastHost = null;
  let shadowRoot = null;

  // Listen for structured problem data from Main World GraphQL interceptor
  window.addEventListener('solvr:problem_detected', (event) => {
    if (event.detail) {
      detectedProblem = event.detail;
      updateFloatingButtonText(`+ Add "${detectedProblem.title}" to SolvR`);
    }
  });

  function extractProblemMetadata() {
    if (detectedProblem && detectedProblem.url === window.location.href) {
      return detectedProblem;
    }

    const url = window.location.href;
    let title = '';
    let difficulty = 'Medium';
    let platform = 'Other';

    // 1. LeetCode
    if (url.includes('leetcode.com/problems/')) {
      platform = 'LeetCode';
      const titleElem =
        document.querySelector('[data-cy="question-title"]') ||
        document.querySelector('div.text-title-large');
      if (titleElem && titleElem.textContent) {
        title = titleElem.textContent.trim().replace(/^[0-9]+\.\s*/, '');
      } else {
        const raw = document.title.replace(/\s*-\s*LeetCode.*$/i, '').replace(/^[0-9]+\.\s*/, '');
        title = raw || url.split('/problems/')[1].split('/')[0].replace(/-/g, ' ');
      }

      const pageText = document.body.innerText;
      if (document.querySelector('.text-difficulty-easy') || pageText.includes('Easy')) {
        difficulty = 'Easy';
      } else if (document.querySelector('.text-difficulty-hard') || pageText.includes('Hard')) {
        difficulty = 'Hard';
      } else {
        difficulty = 'Medium';
      }
    }
    // 2. Codeforces
    else if (url.includes('codeforces.com')) {
      platform = 'Codeforces';
      const titleElem = document.querySelector('.problem-statement .title');
      if (titleElem) {
        title = 'CF ' + titleElem.textContent.trim();
      } else {
        title = document.title.replace(/\s*-\s*Codeforces.*$/i, '').trim();
      }

      const ratingElem = document.querySelector('span[title="Difficulty"]');
      if (ratingElem) {
        const rating = parseInt(ratingElem.textContent.replace('*', ''), 10);
        if (rating < 1200) difficulty = 'Easy';
        else if (rating >= 1700) difficulty = 'Hard';
        else difficulty = 'Medium';
      }
    }
    // 3. GeeksforGeeks
    else if (url.includes('geeksforgeeks.org')) {
      platform = 'GeeksforGeeks';
      const heading =
        document.querySelector('h1') ||
        document.querySelector('.problems_header_content__title__5_b_g');
      title = heading ? heading.textContent.trim() : document.title;
    }
    // 4. HackerRank
    else if (url.includes('hackerrank.com')) {
      platform = 'HackerRank';
      const heading = document.querySelector('h1.ui-icon-label') || document.querySelector('h1');
      title = heading ? heading.textContent.trim() : document.title;
    }

    if (!title) {
      title = document.title.trim();
    }

    return { title, link: url, difficulty, platform, tags: [] };
  }

  function showInPageToast(meta, targetSolvrUrl) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.id = 'solvr-toast-host';
      shadowRoot = toastHost.attachShadow({ mode: 'open' });

      // Inject shadow styles
      const style = document.createElement('style');
      style.textContent = `
        .toast-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          padding: 12px 18px;
          color: #ffffff;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          font-family: system-ui, -apple-system, sans-serif;
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-wrapper.toast-visible {
          transform: translateY(0);
          opacity: 1;
        }
        .toast-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .toast-body { display: flex; flex-direction: column; gap: 2px; }
        .toast-title { font-size: 13px; font-weight: 600; color: #f8fafc; }
        .toast-meta { font-size: 11px; color: #94a3b8; }
        .toast-link {
          color: #38bdf8;
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          margin-left: 6px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(56, 189, 248, 0.1);
        }
        .toast-link:hover { background: rgba(56, 189, 248, 0.2); }
      `;
      shadowRoot.appendChild(style);
      document.body.appendChild(toastHost);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-wrapper';
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-body">
        <div class="toast-title">Saved to SolvR!</div>
        <div class="toast-meta">
          <span>${meta.title} (${meta.difficulty})</span>
          <a class="toast-link" href="${targetSolvrUrl}" target="_blank">Open SolvR ↗</a>
        </div>
      </div>
    `;

    shadowRoot.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function updateFloatingButtonText(text) {
    const btn = document.getElementById('solvr-floating-btn');
    if (btn) {
      const span = btn.querySelector('span');
      if (span) span.textContent = text;
    }
  }

  function injectFloatingButton() {
    if (document.getElementById('solvr-floating-btn')) return;

    const btn = document.createElement('div');
    btn.id = 'solvr-floating-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      <span>+ Add to SolvR</span>
    `;

    btn.addEventListener('click', () => {
      const meta = extractProblemMetadata();
      chrome.storage.sync.get(['solvrBaseUrl'], (res) => {
        const baseUrl = res.solvrBaseUrl || DEFAULT_SOLVR_URL;
        const targetUrl = new URL(baseUrl);
        targetUrl.searchParams.set('quickAdd', '1');
        targetUrl.searchParams.set('title', meta.title);
        targetUrl.searchParams.set('link', meta.link);
        targetUrl.searchParams.set('difficulty', meta.difficulty);
        targetUrl.searchParams.set('platform', meta.platform);

        // Notify background service worker to save to storage
        chrome.runtime.sendMessage({
          type: 'INGEST_PROBLEM',
          problem: meta,
        });

        // Trigger in-page non-intrusive toast instead of tab redirect
        showInPageToast(meta, targetUrl.toString());

        btn.classList.add('solvr-added');
        btn.querySelector('span').textContent = '✓ Saved to SolvR';

        setTimeout(() => {
          btn.classList.remove('solvr-added');
          btn.querySelector('span').textContent = '+ Add to SolvR';
        }, 3000);
      });
    });

    document.body.appendChild(btn);
  }

  // SPA Route Change Detection via MutationObserver & PopState
  let lastUrl = window.location.href;
  const spaObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      detectedProblem = null;
      injectFloatingButton();
    }
  });

  spaObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('popstate', () => {
    lastUrl = window.location.href;
    detectedProblem = null;
    injectFloatingButton();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingButton);
  } else {
    injectFloatingButton();
  }
})();
