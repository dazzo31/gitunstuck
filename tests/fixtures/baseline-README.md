# GitSimple • Modern Git Reference & Beginner Mental Model

A dual-mode Git guide and reference hub built for developers and complete newcomers alike. 

Tired of cheat sheets filled with confusing technical jargon like "DAG", "cryptographic blobs", and "detached HEADs"? **GitSimple** translates Git into plain English with real-world analogies while providing a full developer reference when you're ready.

---

## 💡 The 60-Second Mental Model (For Complete Beginners)

| Git Concept | Real-World Analogy | What it actually means |
| :--- | :--- | :--- |
| **Repository ("Repo")** | 📁 **Project folder + Time machine** | A normal folder on your computer that automatically tracks and remembers every edit you make. |
| **Commit** | 💾 **Video Game Save Point** | A permanent checkpoint. If you make a mistake later, you can reload your project right here. |
| **Staging (`git add`)** | 🛒 **A Shopping Cart** | Putting selected files into a cart before you pay at the register (`git commit`) to seal the checkpoint. |
| **Remote & GitHub** | ☁️ **Google Drive for Code** | A cloud copy of your project so your work is safe and teammates can collaborate. |
| **Branch** | 🌿 **A Risk-Free Sandbox** | A safe draft where you can test crazy experiments without breaking your working project. |
| **Pipeline (CI/CD)** | 🤖 **Automated Cloud Robot** | A helper that automatically tests and publishes your code the moment you push to GitHub. |

---

## ⚡ Your Entire Daily Routine (Only 3 Commands)

When you're starting out, 95% of your work is just these 3 steps:

```bash
# 1. Put all your changes into the cart:
git add .

# 2. Seal the checkpoint with a descriptive message:
git commit -m "Added button to homepage"

# 3. Upload your checkpoint to GitHub:
git push
```

---

## 🛠️ Features

- 🌱 **Dual Mode Experience:** Toggle between **"Plain English"** (friendly beginner mode) and **"Developer Hub"** (full command matrix).
- 🔍 **Instant Search:** Find commands and concepts instantly by typing in the search bar or pressing `/`.
- 🌓 **Dark / Light Theme:** Persistent theme toggling with high contrast.
- 📋 **1-Click Copy:** Copy commands with instant visual feedback.
- 🖨️ **Print & PDF Mode:** Clean `@media print` layout ready for printing as a cheat sheet or saving as PDF.

---

## 📦 How to Push to GitHub

1. Create an empty repository on [GitHub](https://github.com/new) (e.g. `git-simple`).
2. Run in PowerShell or terminal:

```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Your web app will automatically deploy to GitHub Pages via `.github/workflows/deploy.yml`!

---

## 📄 License
MIT License. Free for personal and team use.
