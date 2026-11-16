// SolvR Extension Background Service Worker (Manifest V3)
const DEFAULT_SOLVR_URL = 'https://question-tracker-khaki.vercel.app';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['solvrBaseUrl'], (res) => {
    if (!res.solvrBaseUrl) {
      chrome.storage.sync.set({ solvrBaseUrl: DEFAULT_SOLVR_URL });
    }
  });
});

// External message listener for 1-click web app authentication handshake
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_HANDSHAKE') {
    chrome.storage.local.set(
      {
        solvrUser: message.user,
        solvrProfile: message.profile,
        pairedAt: Date.now(),
      },
      () => {
        sendResponse({ success: true, message: 'Paired with SolvR successfully' });
      }
    );
    return true; // Keep message channel open for async response
  }
});

// Internal message listener for problem ingestion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INGEST_PROBLEM' && message.problem) {
    chrome.storage.local.get(['solvrRecentProblems'], (res) => {
      const recent = res.solvrRecentProblems || [];
      const updated = [
        {
          ...message.problem,
          savedAt: Date.now(),
        },
        ...recent.filter((p) => p.link !== message.problem.link),
      ].slice(0, 20);

      chrome.storage.local.set({ solvrRecentProblems: updated }, () => {
        sendResponse({ success: true, count: updated.length });
      });
    });
    return true;
  }
});
