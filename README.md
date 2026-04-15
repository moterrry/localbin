# 📝 LocalBin

**LocalBin** is a lightweight, self-hosted, file-based pastebin designed for speed and simplicity. Perfect for sharing code snippets securely within a local network or as a private instance.

![LocalBin Banner](https://i.imgur.com/iDg7cIi.png)

## ✨ Features

- 🚀 **Lightning Fast**: Built with Express.js for minimal overhead.
- 📂 **No Database Required**: Uses simple JSON files for storage.
- 🔐 **Secure**: Optional password protection using `bcrypt` hashing.
- 🕒 **Auto-Cleanup**: Set expiration times for pastes (1h, 24h, 7d, 30d).
- 🎨 **Syntax Highlighting**: Supports 30+ languages out of the box.
- 📱 **Mobile Friendly**: Fully responsive UI with a modern dark mode.

## 🚀 Quick Start

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/terry/localbin.git
   cd localbin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Copy the example environment file and adjust variables if needed:
   ```bash
   cp .env.example .env
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The app will be running at `http://localhost:3000`.

## 🛠 Configuration

You can configure LocalBin using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port the server listens on | `3000` |
| `PASTE_DIR` | Directory where paste files are stored | `./pastes` |

## 📖 Usage

1. Paste your code into the editor.
2. Select the syntax highlighting language.
3. (Optional) Set an expiration time.
4. (Optional) Set a password to protect the paste.
5. Click **Share** to get a unique URL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Made with ❤️ by [Terry](https://github.com/moterrry)
