# 💻 Insighta Labs CLI
A Node.js command-line tool for remote authentication and account management within the Insighta ecosystem.

### 🚀 Key Features
*   **Headless Handshake**: Uses a temporary local HTTP server (Port 8001) to securely capture tokens from the browser redirect.
*   **Local Persistence**: Stores session tokens in `~/.insighta/credentials.json` for persistent terminal access.
*   **Command Architecture**: Built with `Commander.js` for a clean, professional terminal interface.

### 🛠️ Local Installation
1.  **Clone and Link**:
    ```bash
    npm install
    npm link
    ```
2.  **Login**:
    ```bash
    insighta login
    ```
3.  **Verify**:
    ```bash
    insighta whoami
    ```

### 📦 Dependencies
*   `axios`: For API communication.
*   `open`: For triggering the browser-based OAuth flow.
*   `commander`: For parsing CLI arguments and commands.