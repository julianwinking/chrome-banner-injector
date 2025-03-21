# Chrome Banner Injector

The **Chrome Banner Injector** is a Chrome extension that allows users to inject customizable banners into specific websites. This extension is useful for displaying important messages, alerts, or reminders at the top of a webpage.

## Features

- Injects a banner at the top of specified websites.
- Customizable banner text for each website.
- Persistent configuration using Chrome's storage API.
- Clean and responsive design with a close button for dismissing the banner.
- Easy-to-use configuration interface.

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click on **Load unpacked** and select the project folder.
5. The extension will now be installed and ready to use.

## Usage

1. Open the extension's popup by clicking on its icon in the Chrome toolbar.
2. Add a new website configuration by specifying:
   - The website URL (or part of it).
   - The banner text to display.
3. Save the configuration.
4. Visit the specified website, and the banner will appear at the top of the page.

## Project Structure

```
chrome-banner-injector/
├── background.js       # Handles background tasks and tab updates
├── content.js          # Injects the banner into the webpage
├── style.css           # Styles for the banner and popup
├── manifest.json       # Chrome extension manifest file
├── README.md           # Project documentation
```

## Configuration

The extension uses Chrome's `chrome.storage.sync` API to store website configurations. Each configuration includes:
- `website`: The URL or part of the URL where the banner should appear.
- `bannerText`: The text to display in the banner.

## Development

### Prerequisites
- Google Chrome
- Basic knowledge of JavaScript, HTML, and CSS

### Steps
1. Modify the files as needed.
2. Reload the extension in `chrome://extensions/` after making changes.
3. Test the functionality on your desired websites.

## Known Issues

- The banner may not appear on websites with restrictive Content Security Policies (CSP).
- If the configuration is not saved, ensure that Chrome's storage permissions are enabled.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Thank you for using the Chrome Banner Injector!