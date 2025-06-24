# Chrome Banner Injector

The **Chrome Banner Injector** is a Chrome extension that allows users to inject customizable banners into specific websites. This extension is useful for displaying important messages, alerts, or reminders at the top of a webpage.

## Features

- Injects a banner at the top of specified websites
- Customizable banner text for each website
- Session timer that tracks time spent on websites (including subpages)
- Custom buttons with configurable links for each website
- Customizable colors for each banner
- Temporarily hide a banner for a selected duration (1 minute to 1 hour)

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
   - **Optional**: Custom button text and URL.
   - **Optional**: Enable session timer to track time spent on the website.
3. Configure global settings:
   - Set the session timeout (how long before a session resets after closing all tabs).
4. Save the configuration.
5. Visit the specified website, and the banner will appear at the top of the page with your configured features.

## Project Structure

```
chrome-banner-injector/
├── background.js       # Handles background tasks such as managing configurations and responding to events.
├── content.js          # Injects the banner into the webpage and manages its behavior.
├── popup.html          # Defines the structure of the extension's popup interface.
├── popup.js            # Implements the logic for the popup interface, including user interactions and configuration updates.
├── style.css           # Contains the styles for the banner and the extension's popup interface.
├── manifest.json       # Defines the extension's metadata, permissions, and resources.
├── README.md           # Provides detailed documentation about the project, including installation and usage instructions.
```

## Configuration

The extension uses Chrome's `chrome.storage.sync` API to store website configurations and global settings. Each configuration includes:
- `website`: The URL or part of the URL where the banner should appear.
- `bannerText`: The text to display in the banner.
- `buttonText`: Optional custom button text.
- `buttonUrl`: Optional custom button URL.
- `showTimer`: Boolean to enable/disable session timer.

Global settings include:
- `sessionTimeout`: Time in minutes after which a session resets when all tabs are closed (default: 5 minutes).


## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
