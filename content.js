chrome.storage.sync.get("websiteConfigs", (data) => {
    const configs = data.websiteConfigs || [];
    const currentUrl = window.location.href;

    const matchingConfig = configs.find(config => currentUrl.includes(config.website));
    if (matchingConfig) {
        const bannerContainer = document.createElement('div');
        bannerContainer.id = 'banner-container';
        bannerContainer.className = 'banner-container'; // Add a class for styling

        // Create the text container
        const textContainer = document.createElement('div');
        textContainer.className = 'banner-text';
        textContainer.textContent = matchingConfig.bannerText;

        // Create the button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'banner-button';
        buttonContainer.innerHTML = `<button id="close-banner">✖</button>`;

        // Append the text and button containers to the banner container
        bannerContainer.appendChild(textContainer);
        bannerContainer.appendChild(buttonContainer);

        // Inject the banner container into the website
        document.body.prepend(bannerContainer);

        // Add functionality to close the banner
        document.getElementById('close-banner').onclick = () => {
            bannerContainer.style.display = 'none';
        };
    }
});