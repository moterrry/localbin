// Create paste
async function createPaste() {
    const codeEl = document.getElementById("code");
    const langEl = document.getElementById("language");
    const expEl = document.getElementById("expiration");
    const pwEl = document.getElementById("password");
    
    if (!codeEl || !codeEl.value.trim()) {
        alert("Please enter some code");
        return;
    }

    const payload = {
        code: codeEl.value,
        language: langEl.value,
        expiration: expEl ? expEl.value : "never",
        password: pwEl ? pwEl.value : ""
    };

    try {
        const btn = document.getElementById("submit-btn");
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sharing...';
        btn.disabled = true;

        const res = await fetch("/api/paste", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            alert(await res.text());
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        const data = await res.json();
        window.location.href = data.url;
    } catch (err) {
        console.error("Error creating paste:", err);
        alert("Failed to create paste");
    }
}

// Load paste if on paste page
if (window.location.pathname.startsWith("/paste/")) {
    const id = window.location.pathname.split("/")[2];

    async function loadPaste(password = "") {
        const headers = {};
        if (password) {
            headers["x-paste-password"] = password;
        }

        try {
            const res = await fetch(`/api/paste/${id}`, { headers });
            
            if (res.status === 401) {
                // Password protected
                showPasswordPrompt();
                return;
            }

            if (res.status === 403) {
                alert("Incorrect password");
                showPasswordPrompt();
                return;
            }

            if (!res.ok) {
                if (res.status === 410) throw new Error("Paste expired");
                throw new Error("Not found");
            }

            const data = await res.json();
            displayPaste(data);
        } catch (err) {
            console.error("Error loading paste:", err);
            displayError(err.message);
        }
    }

    function displayPaste(data) {
        const codeEl = document.getElementById("code");
        const metaEl = document.getElementById("paste-meta");
        
        if (!codeEl) return;

        // Hide prompt if visible
        const promptEl = document.getElementById("password-prompt");
        if (promptEl) promptEl.style.display = "none";

        // Set content
        codeEl.textContent = data.code;

        // Language mapping / Normalize for Prism
        const lang = data.language || "plaintext";
        codeEl.className = "language-" + lang;

        // Update meta info
        if (metaEl) {
            const date = new Date(data.createdAt).toLocaleString();
            let metaHtml = `
                <span>Language: <strong>${lang.toUpperCase()}</strong></span>
                <span>Created: <strong>${date}</strong></span>
            `;
            if (data.expiresAt) {
                const expDate = new Date(data.expiresAt).toLocaleString();
                metaHtml += `<span style="color: #f85149;">Expires: <strong>${expDate}</strong></span>`;
            }
            metaEl.innerHTML = metaHtml;
        }

        // Trigger Prism highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightElement(codeEl);
        }
    }

    function showPasswordPrompt() {
        const codeEl = document.getElementById("code");
        if (codeEl) codeEl.textContent = "This paste is password protected...";
        
        // Create or show password prompt UI
        let promptEl = document.getElementById("password-prompt");
        if (!promptEl) {
            promptEl = document.createElement("div");
            promptEl.id = "password-prompt";
            promptEl.style = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card-bg); padding: 30px; border: 1px solid var(--accent-color); border-radius: 12px; text-align: center; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.5);";
            promptEl.innerHTML = `
                <h3 style="margin-bottom: 20px;">Protected Paste</h3>
                <input type="password" id="unlock-pw" placeholder="Enter password..." style="background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 10px; border-radius: 6px; width: 100%; margin-bottom: 15px; outline: none;">
                <button onclick="unlockPaste()" style="width: 100%; justify-content: center;">Unlock</button>
            `;
            document.querySelector(".code-wrapper").appendChild(promptEl);
            
            // Allow Enter key
            document.getElementById("unlock-pw").addEventListener("keypress", (e) => {
                if (e.key === "Enter") unlockPaste();
            });
        }
        promptEl.style.display = "block";
        document.getElementById("unlock-pw").focus();
    }

    window.unlockPaste = function() {
        const pw = document.getElementById("unlock-pw").value;
        loadPaste(pw);
    };

    function displayError(message) {
        const container = document.querySelector(".container");
        if (container) {
            container.innerHTML = `
                <header class="header">
                    <a href="/" class="logo">Local<span>bin</span></a>
                </header>
                <div style="text-align: center; padding: 50px;">
                    <h2>${message}</h2>
                    <p style="color: var(--text-secondary); margin-top: 10px;">The paste may have been deleted, expired, or never existed.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px;">
                        <button>Go Home</button>
                    </a>
                </div>
            `;
        }
    }

    loadPaste();
}

// Copy button
function copyCode() {
    const code = document.getElementById("code").textContent;
    if (code === "This paste is password protected...") return;
    
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector("button.secondary");
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Copied!
        `;
        btn.style.background = "#28a745";
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "";
        }, 2000);
    });
}
