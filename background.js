let activeTabId = null;
let tabData = {};

function updateTimeSpent() {
  if (activeTabId && tabData[activeTabId]) {
    const currentTime = new Date().getTime();
    const timeSpent = (currentTime - tabData[activeTabId].startTime) / 60000; // Convert to minutes
    tabData[activeTabId].totalTime += timeSpent;
    tabData[activeTabId].startTime = currentTime;
    chrome.storage.local.set({ tabData: tabData });
  }
}

function startTimer(tabId) {
  updateTimeSpent(); // Update time for the previous active tab
  activeTabId = tabId;
  
  if (!tabData[tabId]) {
    chrome.tabs.get(tabId, (tab) => {
      tabData[tabId] = {
        url: tab.url,
        title: tab.title,
        totalTime: 0,
        startTime: new Date().getTime()
      };
      chrome.storage.local.set({ tabData: tabData });
    });
  } else {
    tabData[tabId].startTime = new Date().getTime();
    chrome.storage.local.set({ tabData: tabData });
  }
}

function stopTimer() {
  updateTimeSpent();
  activeTabId = null;
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  startTimer(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === activeTabId) {
    tabData[tabId].url = tab.url;
    tabData[tabId].title = tab.title;
    chrome.storage.local.set({ tabData: tabData });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    stopTimer();
  }
  if (tabData[tabId]) {
    delete tabData[tabId];
    chrome.storage.local.set({ tabData: tabData });
  }
});

// Update time spent for the active tab every second
setInterval(updateTimeSpent, 1000);
