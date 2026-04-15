const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

const PASTE_DIR = path.resolve(process.env.PASTE_DIR || "pastes");

// Ensure folder exists
if (!fs.existsSync(PASTE_DIR)) {
    fs.mkdirSync(PASTE_DIR);
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Create paste
app.post("/api/paste", async (req, res) => {
    const { code, language, expiration, password } = req.body;

    if (!code) return res.status(400).send("Code required");

    const id = uuidv4().slice(0, 8);
    const filePath = path.join(PASTE_DIR, `${id}.json`);

    let expiresAt = null;
    if (expiration && expiration !== "never") {
        const hours = parseInt(expiration);
        expiresAt = Date.now() + hours * 60 * 60 * 1000;
    }

    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    const data = {
        code,
        language,
        createdAt: Date.now(),
        expiresAt,
        password: hashedPassword
    };

    fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) return res.status(500).send("Error saving paste");
        res.json({ url: `/paste/${id}` });
    });
});

// Get paste
app.get("/api/paste/:id", (req, res) => {
    const filePath = path.join(PASTE_DIR, `${req.params.id}.json`);
    const providedPassword = req.headers["x-paste-password"];

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("Not found");
    }

    fs.readFile(filePath, "utf-8", async (err, rawData) => {
        if (err) return res.status(500).send("Error reading paste");

        const data = JSON.parse(rawData);

        // Check expiration
        if (data.expiresAt && Date.now() > data.expiresAt) {
            fs.unlink(filePath, () => {}); // Delete expired file
            return res.status(410).send("Paste expired");
        }

        // Check password
        if (data.password) {
            if (!providedPassword) {
                return res.status(401).json({ protected: true });
            }

            const match = await bcrypt.compare(providedPassword, data.password);
            if (!match) {
                return res.status(403).send("Incorrect password");
            }
        }

        // Return data (without password hash)
        const { password, ...safeData } = data;
        res.json(safeData);
    });
});

// Serve paste page
app.get("/paste/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "paste.html"));
});

// Cron-like cleanup for expired pastes (every hour)
setInterval(() => {
    fs.readdir(PASTE_DIR, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(PASTE_DIR, file);
            fs.readFile(filePath, "utf-8", (err, rawData) => {
                if (err) return;
                try {
                    const data = JSON.parse(rawData);
                    if (data.expiresAt && Date.now() > data.expiresAt) {
                        fs.unlink(filePath, () => {});
                    }
                } catch (e) {}
            });
        });
    });
}, 3600000);

app.listen(PORT, () => {
    console.log(`Localbin running at http://localhost:${PORT}`);
});