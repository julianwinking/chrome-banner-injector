document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('website-config-form');
    const configList = document.getElementById('website-config-list');
    const saveSettingsBtn = document.getElementById('save-settings');
    const sessionTimeoutInput = document.getElementById('session-timeout');
    const closePopupBtn = document.getElementById('close-popup');
    const noBannersMessage = document.getElementById('no-banners-message');

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Initialize tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        // Add active class to selected button and panel
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activePanel = document.getElementById(`${tabName}-tab`);
        
        if (activeButton && activePanel) {
            activeButton.classList.add('active');
            activePanel.classList.add('active');
        }

        // Update existing banners list when switching to that tab
        if (tabName === 'existing-banners') {
            updateExistingBannersList();
        }
    }

    function updateExistingBannersList() {
        chrome.storage.sync.get(['websiteConfigs'], (data) => {
            const configs = data.websiteConfigs || [];
            configList.innerHTML = '';
            
            if (configs.length === 0) {
                noBannersMessage.style.display = 'block';
            } else {
                noBannersMessage.style.display = 'none';
                configs.forEach(addConfigToList);
            }
        });
    }

    // Close popup functionality
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            window.close();
        });
    }

    // Close popup with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.close();
        }
    });

    // Load existing configurations and settings
    chrome.storage.sync.get(['websiteConfigs', 'globalSettings'], (data) => {
        const configs = data.websiteConfigs || [];
        const settings = data.globalSettings || { sessionTimeout: 5 };
        
        // Load settings
        sessionTimeoutInput.value = settings.sessionTimeout;
        
        // Load existing banners (will be shown when tab is switched)
        if (configs.length === 0) {
            noBannersMessage.style.display = 'block';
        }
    });

    // Save global settings
    saveSettingsBtn.addEventListener('click', () => {
        const settings = {
            sessionTimeout: parseInt(sessionTimeoutInput.value) || 5
        };
        
        chrome.storage.sync.set({ globalSettings: settings }, () => {
            // Visual feedback
            const originalText = saveSettingsBtn.textContent;
            saveSettingsBtn.textContent = 'Saved!';
            saveSettingsBtn.classList.add('success');
            setTimeout(() => {
                saveSettingsBtn.textContent = originalText;
                saveSettingsBtn.classList.remove('success');
            }, 2000);
        });
    });

    // Add new configuration
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const website = form.website.value.trim();
        const bannerText = form.bannerText.value.trim();
        const buttonText = form.buttonText.value.trim();
        const buttonUrl = form.buttonUrl.value.trim();
        const showTimer = form.showTimer.checked;

        if (!website || !bannerText) return;

        const newConfig = { 
            website, 
            bannerText,
            buttonText: buttonText || null,
            buttonUrl: buttonUrl || null,
            showTimer
        };

        chrome.storage.sync.get('websiteConfigs', (data) => {
            const configs = data.websiteConfigs || [];
            configs.push(newConfig);
            chrome.storage.sync.set({ websiteConfigs: configs }, () => {
                // Clear form
                form.reset();
                
                // Show success message
                showSuccessMessage('Banner added successfully!');
                
                // Switch to existing banners tab to show the new banner
                switchTab('existing-banners');
            });
        });
    });

    // Success message function
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const container = document.getElementById('popup-container');
        container.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Add configuration to the list
    function addConfigToList(config) {
        const item = document.createElement('div');
        item.className = 'config-item';
        
        const features = [];
        if (config.buttonText) features.push('Custom Button');
        if (config.showTimer) features.push('Session Timer');
        const featuresText = features.length ? ` • ${features.join(', ')}` : '';
        
        item.innerHTML = `
            <div class="config-details">
                <div class="config-header">
                    <span class="config-website">${config.website}</span>
                    <button class="delete-btn" data-website="${config.website}" title="Delete banner">🗑️</button>
                </div>
                <div class="config-text">${config.bannerText}</div>
                <div class="config-features">${featuresText}</div>
            </div>
        `;
        configList.appendChild(item);

        // Delete configuration
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete the banner for "${config.website}"?`)) {
                chrome.storage.sync.get('websiteConfigs', (data) => {
                    const configs = data.websiteConfigs || [];
                    const updatedConfigs = configs.filter(c => c.website !== config.website);
                    chrome.storage.sync.set({ websiteConfigs: updatedConfigs }, () => {
                        item.remove();
                        
                        // Check if list is empty
                        if (updatedConfigs.length === 0) {
                            noBannersMessage.style.display = 'block';
                        }
                    });
                });
            }
        });
    }
});