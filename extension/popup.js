const DEFAULT_SOLVR_URL = 'https://question-tracker-khaki.vercel.app';

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  if (!currentTab || !currentTab.url) return;

  const url = currentTab.url;
  const title = currentTab.title || 'Practice Problem';

  let platform = 'Other';
  let cleanTitle = title;
  let difficulty = 'Medium';

  if (url.includes('leetcode.com/problems/')) {
    platform = 'LeetCode';
    cleanTitle = title.replace(/\s*-\s*LeetCode.*$/i, '').replace(/^[0-9]+\.\s*/, '');
  } else if (url.includes('codeforces.com')) {
    platform = 'Codeforces';
    cleanTitle = 'CF ' + title.replace(/\s*-\s*Codeforces.*$/i, '');
  } else if (url.includes('geeksforgeeks.org')) {
    platform = 'GeeksforGeeks';
  } else if (url.includes('hackerrank.com')) {
    platform = 'HackerRank';
  }

  document.getElementById('prob-title').textContent = cleanTitle;
  document.getElementById('prob-platform').textContent = platform;
  document.getElementById('prob-difficulty').textContent = difficulty;

  document.getElementById('add-btn').addEventListener('click', () => {
    chrome.storage.sync.get(['solvrBaseUrl'], (res) => {
      const baseUrl = res.solvrBaseUrl || DEFAULT_SOLVR_URL;
      const targetUrl = new URL(baseUrl);
      targetUrl.searchParams.set('quickAdd', '1');
      targetUrl.searchParams.set('title', cleanTitle);
      targetUrl.searchParams.set('link', url);
      targetUrl.searchParams.set('difficulty', difficulty);
      targetUrl.searchParams.set('platform', platform);

      chrome.tabs.create({ url: targetUrl.toString() });
    });
  });
});
