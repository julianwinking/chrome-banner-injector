document.getElementById('save').addEventListener('click', () => {
    const websites = document.getElementById('websites').value.split(',').map(url => url.trim());
    const bannerMessage = document.getElementById('bannerMessage').value;
    chrome.storage.sync.set({ websites, bannerMessage }, () => {
        alert('Settings saved!');
    });
});