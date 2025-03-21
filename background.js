chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        websiteConfigs: []
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.sync.get("websiteConfigs", (data) => {
            const configs = data.websiteConfigs || [];
            if (configs.some(config => tab.url.includes(config.website))) {
                // Ensure the scripting API is used correctly
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error injecting content script:", chrome.runtime.lastError.message);
                    }
                });

                chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    files: ['style.css']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error injecting CSS:", chrome.runtime.lastError.message);
                    }
                });
            }
        });
    }
});