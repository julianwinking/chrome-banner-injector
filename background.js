chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        websiteConfigs: [],
        globalSettings: { sessionTimeout: 5 },
        sessionData: {}
    });
});

// Track tab sessions for timer functionality
let activeSessions = new Map(); // domain -> { startTime, lastActivity, tabIds }

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.sync.get("websiteConfigs", (data) => {
            const configs = data.websiteConfigs || [];
            const matchingConfig = configs.find(config => tab.url.includes(config.website));
            
            if (matchingConfig) {
                // Check if content script is already injected to prevent duplicates
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => window.bannerInjectorLoaded || false
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error checking script injection:", chrome.runtime.lastError.message);
                        return;
                    }
                    
                    // Only inject if not already loaded
                    if (!results || !results[0] || !results[0].result) {
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

                    // Start session tracking if timer is enabled
                    if (matchingConfig.showTimer) {
                        // Extract domain from tab URL for consistent tracking
                        const url = new URL(tab.url);
                        const tabDomain = url.hostname;
                        startSessionTracking(tabDomain, tabId);
                    }
                });
            }
        });
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    // Remove tab from session tracking
    for (let [domain, session] of activeSessions.entries()) {
        if (session.tabIds.has(tabId)) {
            session.tabIds.delete(tabId);
            if (session.tabIds.size === 0) {
                // No more tabs for this domain, start timeout timer
                chrome.storage.sync.get('globalSettings', (data) => {
                    const settings = data.globalSettings || { sessionTimeout: 5 };
                    const timeoutMs = settings.sessionTimeout * 60 * 1000;
                    
                    setTimeout(() => {
                        if (activeSessions.has(domain) && activeSessions.get(domain).tabIds.size === 0) {
                            resetSession(domain);
                        }
                    }, timeoutMs);
                });
            }
        }
    }
});

function startSessionTracking(domain, tabId) {
    console.log('Starting session tracking for domain:', domain, 'tabId:', tabId);
    chrome.storage.sync.get('sessionData', (data) => {
        const sessionData = data.sessionData || {};
        const now = Date.now();
        
        if (!activeSessions.has(domain)) {
            // Check if we have stored session data
            const storedSession = sessionData[domain];
            let startTime = now;
            
            console.log('Stored session for', domain, ':', storedSession);
            
            if (storedSession) {
                chrome.storage.sync.get('globalSettings', (settingsData) => {
                    const settings = settingsData.globalSettings || { sessionTimeout: 5 };
                    const timeoutMs = settings.sessionTimeout * 60 * 1000;
                    
                    if (now - storedSession.lastActivity < timeoutMs) {
                        // Resume existing session
                        startTime = storedSession.startTime;
                        console.log('Resuming existing session with startTime:', new Date(startTime));
                    }
                    
                    activeSessions.set(domain, {
                        startTime,
                        lastActivity: now,
                        tabIds: new Set([tabId])
                    });
                    
                    console.log('Created active session for', domain, 'with startTime:', new Date(startTime));
                    
                    // Update stored session data
                    sessionData[domain] = {
                        startTime: activeSessions.get(domain).startTime,
                        lastActivity: now
                    };
                    chrome.storage.sync.set({ sessionData });
                });
            } else {
                activeSessions.set(domain, {
                    startTime,
                    lastActivity: now,
                    tabIds: new Set([tabId])
                });
                
                console.log('Created new session for', domain, 'with startTime:', new Date(startTime));
                
                // Update stored session data
                sessionData[domain] = {
                    startTime,
                    lastActivity: now
                };
                chrome.storage.sync.set({ sessionData });
            }
        } else {
            // Add tab to existing session
            activeSessions.get(domain).tabIds.add(tabId);
            activeSessions.get(domain).lastActivity = now;
            
            // Update stored session data
            sessionData[domain] = {
                startTime: activeSessions.get(domain).startTime,
                lastActivity: now
            };
            chrome.storage.sync.set({ sessionData });
        }
    });
}

function resetSession(domain) {
    activeSessions.delete(domain);
    chrome.storage.sync.get('sessionData', (data) => {
        const sessionData = data.sessionData || {};
        delete sessionData[domain];
        chrome.storage.sync.set({ sessionData });
    });
}

// Message handling for timer updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSessionTime') {
        const domain = request.domain;
        console.log('getSessionTime request for domain:', domain);
        console.log('Active sessions:', Array.from(activeSessions.keys()));
        
        const session = activeSessions.get(domain);
        
        if (session) {
            const elapsed = Date.now() - session.startTime;
            console.log('Found active session, elapsed:', elapsed);
            sendResponse({ elapsed });
        } else {
            console.log('No active session, checking stored data');
            chrome.storage.sync.get('sessionData', (data) => {
                const sessionData = data.sessionData || {};
                const storedSession = sessionData[domain];
                console.log('Stored session data:', storedSession);
                
                if (storedSession) {
                    chrome.storage.sync.get('globalSettings', (settingsData) => {
                        const settings = settingsData.globalSettings || { sessionTimeout: 5 };
                        const timeoutMs = settings.sessionTimeout * 60 * 1000;
                        
                        if (Date.now() - storedSession.lastActivity < timeoutMs) {
                            const elapsed = Date.now() - storedSession.startTime;
                            console.log('Using stored session, elapsed:', elapsed);
                            sendResponse({ elapsed });
                        } else {
                            console.log('Stored session expired');
                            sendResponse({ elapsed: 0 });
                        }
                    });
                } else {
                    sendResponse({ elapsed: 0 });
                }
            });
        }
        return true; // Keep message channel open for async response
    }
});