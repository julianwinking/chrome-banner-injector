chrome.storage.sync.get("bannerMessage", (data) => {
    const banner = document.createElement('div');
    banner.id = 'simple-banner';
    banner.innerHTML = `<span>${data.bannerMessage}</span>
        <button id="close-banner">✖</button>`;
    document.body.prepend(banner);

    document.getElementById('close-banner').onclick = () => {
        banner.style.display = 'none';
    };
});