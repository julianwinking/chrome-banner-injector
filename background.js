chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        websites: [],
        bannerMessage: "Your custom message here"
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.sync.get(["websites", "bannerMessage"], (data) => {
            const { websites, bannerMessage } = data;
            if (websites.some(url => tab.url.includes(url))) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    files: ['styles.css']
                });
            }
        });
    }
});