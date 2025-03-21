document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('website-config-form');
    const configList = document.getElementById('website-config-list');

    // Load existing configurations
    chrome.storage.sync.get('websiteConfigs', (data) => {
        const configs = data.websiteConfigs || [];
        configs.forEach(addConfigToList);
    });

    // Add new configuration
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const website = form.website.value.trim();
        const bannerText = form.bannerText.value.trim();

        if (!website || !bannerText) return;

        const newConfig = { website, bannerText };

        chrome.storage.sync.get('websiteConfigs', (data) => {
            const configs = data.websiteConfigs || [];
            configs.push(newConfig);
            chrome.storage.sync.set({ websiteConfigs: configs }, () => {
                addConfigToList(newConfig);
                form.reset();
            });
        });
    });

    // Add configuration to the list
    function addConfigToList(config) {
        const item = document.createElement('div');
        item.className = 'config-item';
        item.innerHTML = `
            <span>${config.website}</span>
            <button data-website="${config.website}">Delete</button>
        `;
        configList.appendChild(item);

        // Delete configuration
        item.querySelector('button').addEventListener('click', () => {
            chrome.storage.sync.get('websiteConfigs', (data) => {
                const configs = data.websiteConfigs || [];
                const updatedConfigs = configs.filter(c => c.website !== config.website);
                chrome.storage.sync.set({ websiteConfigs: updatedConfigs }, () => {
                    item.remove();
                });
            });
        });
    }
});