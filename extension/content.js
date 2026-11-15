// SolvR Browser Content Script
(function () {
  const DEFAULT_SOLVR_URL = 'https://question-tracker-khaki.vercel.app';

  function extractProblemMetadata() {
    const url = window.location.href;
    let title = '';
    let difficulty = 'Medium';
    let platform = 'Other';

    // 1. LeetCode
    if (url.includes('leetcode.com/problems/')) {
      platform = 'LeetCode';
      // Try DOM title
      const titleElem = document.querySelector('[data-cy="question-title"]') || document.querySelector('div.text-title-large');
      if (titleElem && titleElem.textContent) {
        title = titleElem.textContent.trim().replace(/^[0-9]+\.\s*/, '');
      } else {
        // Fallback from document title or URL
        const raw = document.title.replace(/\s*-\s*LeetCode.*$/i, '').replace(/^[0-9]+\.\s*/, '');
        title = raw || url.split('/problems/')[1].split('/')[0].replace(/-/g, ' ');
      }

      // Difficulty
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

      // Check rating tag if present
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
      const heading = document.querySelector('h1') || document.querySelector('.problems_header_content__title__5_b_g');
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

    return { title, link: url, difficulty, platform };
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

        btn.classList.add('solvr-added');
        btn.querySelector('span').textContent = '✓ Opening SolvR...';

        window.open(targetUrl.toString(), '_blank');

        setTimeout(() => {
          btn.classList.remove('solvr-added');
          btn.querySelector('span').textContent = '+ Add to SolvR';
        }, 3000);
      });
    });

    document.body.appendChild(btn);
  }

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFloatingButton);
  } else {
    injectFloatingButton();
  }
})();
