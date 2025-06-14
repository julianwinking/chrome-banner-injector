// Prevent multiple script injections
if (!window.bannerInjectorLoaded) {
    window.bannerInjectorLoaded = true;

    chrome.storage.sync.get("websiteConfigs", (data) => {
        const configs = data.websiteConfigs || [];
        const currentUrl = window.location.href;
        const currentDomain = window.location.hostname;

        const matchingConfig = configs.find(config => currentUrl.includes(config.website));
        if (matchingConfig) {
            createBanner(matchingConfig, currentDomain);
        }
    });
}

function cleanupTimers() {
    // Clean up any existing timer intervals
    if (window.bannerTimerIntervals) {
        window.bannerTimerIntervals.forEach(interval => clearInterval(interval));
        window.bannerTimerIntervals = [];
    }
}

function createBanner(config, domain) {
    // Remove any existing banner to prevent duplicates
    const existingBanner = document.getElementById('banner-container');
    if (existingBanner) {
        cleanupTimers();
        existingBanner.remove();
    }

    const bannerContainer = document.createElement('div');
    bannerContainer.id = 'banner-container';
    bannerContainer.className = 'banner-container';

    // Create the main content area
    const contentArea = document.createElement('div');
    contentArea.className = 'banner-content';

    // Create the text container
    const textContainer = document.createElement('div');
    textContainer.className = 'banner-text';
    textContainer.textContent = config.bannerText;

    // Create timer container if enabled
    let timerContainer = null;
    let timerInterval = null;
    if (config.showTimer) {
        timerContainer = document.createElement('div');
        timerContainer.className = 'banner-timer';
        timerContainer.textContent = 'Session: 00:00:00';
        updateTimer(timerContainer, domain);
        
        // Store interval reference for cleanup
        timerInterval = setInterval(() => {
            // Check if extension context is still valid
            if (!chrome.runtime || !chrome.runtime.id) {
                clearInterval(timerInterval);
                return;
            }
            updateTimer(timerContainer, domain);
        }, 1000);
        
        // Store interval reference globally for cleanup
        if (!window.bannerTimerIntervals) {
            window.bannerTimerIntervals = [];
        }
        window.bannerTimerIntervals.push(timerInterval);
    }

    // Add text and timer to content area
    contentArea.appendChild(textContainer);
    if (timerContainer) {
        contentArea.appendChild(timerContainer);
    }

    // Create the button area
    const buttonArea = document.createElement('div');
    buttonArea.className = 'banner-buttons';

    // Add custom button if configured
    if (config.buttonText && config.buttonUrl) {
        const customButton = document.createElement('button');
        customButton.className = 'banner-custom-button';
        customButton.textContent = config.buttonText;
        customButton.onclick = () => {
            window.open(config.buttonUrl, '_blank');
        };
        buttonArea.appendChild(customButton);
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.id = 'close-banner';
    closeButton.className = 'banner-close-button';
    closeButton.textContent = '✖';
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('aria-label', 'Close banner');
    
    // Add multiple event listeners for better compatibility
    closeButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Banner close button clicked (onclick)');
        try {
            cleanupTimers();
            // Use multiple methods to ensure banner is hidden
            bannerContainer.classList.add('banner-hidden');
            bannerContainer.style.setProperty('display', 'none', 'important');
            bannerContainer.style.setProperty('visibility', 'hidden', 'important');
            bannerContainer.style.setProperty('opacity', '0', 'important');
            // Also remove the padding we added
            document.body.style.paddingTop = '0px';
            // Reset any fixed elements we moved
            resetFixedElements();
            console.log('Banner should now be hidden');
        } catch (error) {
            console.log('Error closing banner:', error);
        }
    };
    
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Banner close button clicked (addEventListener)');
        try {
            cleanupTimers();
            bannerContainer.classList.add('banner-hidden');
            bannerContainer.style.setProperty('display', 'none', 'important');
            bannerContainer.style.setProperty('visibility', 'hidden', 'important');
            bannerContainer.style.setProperty('opacity', '0', 'important');
            document.body.style.paddingTop = '0px';
            resetFixedElements();
        } catch (error) {
            console.log('Error closing banner:', error);
        }
    });
    
    buttonArea.appendChild(closeButton);

    // Assemble the banner
    bannerContainer.appendChild(contentArea);
    bannerContainer.appendChild(buttonArea);

    // Inject the banner container into the website
    // Try multiple injection methods for better compatibility
    if (document.body) {
        document.body.prepend(bannerContainer);
    } else if (document.documentElement) {
        document.documentElement.prepend(bannerContainer);
    } else {
        document.append(bannerContainer);
    }
    
    // Force the banner to the top with inline styles as backup
    bannerContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        z-index: 2147483647 !important;
        margin: 0 !important;
        transform: none !important;
    `;

    // Adjust body padding to prevent content overlap
    adjustBodyPadding();
    
    // Force banner position after a small delay to ensure it stays at top
    setTimeout(() => {
        if (bannerContainer && bannerContainer.parentNode) {
            bannerContainer.style.top = '0px';
            bannerContainer.style.position = 'fixed';
            bannerContainer.style.zIndex = '2147483647';
        }
    }, 100);
}

function updateTimer(timerElement, domain) {
    // Check if chrome.runtime is available and extension context is valid
    if (!chrome.runtime || !chrome.runtime.id) {
        // Extension context is invalidated, stop timer updates
        return;
    }

    try {
        console.log('Requesting session time for domain:', domain);
        chrome.runtime.sendMessage(
            { action: 'getSessionTime', domain: domain }, 
            (response) => {
                // Check for chrome.runtime.lastError to handle context invalidation
                if (chrome.runtime.lastError) {
                    console.log('Extension context invalidated, stopping timer updates');
                    return;
                }
                
                console.log('Timer response:', response);
                if (response && response.elapsed) {
                    const elapsed = response.elapsed;
                    const hours = Math.floor(elapsed / (1000 * 60 * 60));
                    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
                    
                    timerElement.textContent = `Session: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                } else {
                    console.log('No elapsed time in response');
                }
            }
        );
    } catch (error) {
        console.log('Failed to send message to background script:', error);
    }
}

function resetFixedElements() {
    // Reset any fixed positioned elements that were moved for the banner
    const fixedElements = document.querySelectorAll('*:not(#banner-container):not(.banner-container)');
    fixedElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' && el.style.top && el.style.top.includes('px')) {
            // Try to reset to original position (assuming it was 0)
            const currentTop = parseInt(el.style.top);
            if (currentTop > 0) {
                el.style.top = '0px';
            }
        }
    });
}

function adjustBodyPadding() {
    const banner = document.getElementById('banner-container');
    if (banner) {
        const bannerHeight = banner.offsetHeight;
        document.body.style.paddingTop = `${bannerHeight}px`;
        
        // Also adjust any fixed positioned elements at the top (but exclude our banner)
        const fixedElements = document.querySelectorAll('*:not(#banner-container):not(.banner-container)');
        fixedElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed' && parseInt(style.top) === 0 && el !== banner) {
                // Only move elements that aren't our banner
                el.style.top = `${bannerHeight}px`;
            }
        });
    }
}

// Handle dynamic content changes
const observer = new MutationObserver(() => {
    adjustBodyPadding();
});
observer.observe(document.body, { childList: true, subtree: true });

// Clean up timers when page is unloaded
window.addEventListener('beforeunload', () => {
    cleanupTimers();
});

// Clean up timers when extension context is invalidated
window.addEventListener('unload', () => {
    cleanupTimers();
});

// Periodically check if extension context is still valid and clean up if not
setInterval(() => {
    if (!chrome.runtime || !chrome.runtime.id) {
        cleanupTimers();
    }
}, 5000); // Check every 5 seconds