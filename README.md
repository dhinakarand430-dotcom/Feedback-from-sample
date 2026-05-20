# Feedback Flow 📩

**Feedback Flow** is a modern, responsive, and mobile-friendly feedback submission web application. It features a premium glassmorphic dark UI, interactive 1-5 star ratings, client & server-side validation, anti-spam mechanisms, a password-secured Admin dashboard, CSV export capability, and automatic notifications routed directly to your Telegram chat using the Telegram Bot API.

---

## 🚀 Key Features

* **Interactive Form**: Smooth 1-5 star selector with hover states, full validations, and descriptive tags.
* **Premium Dark UI**: Built with rich midnight gradients, responsive glassmorphic cards, and pulse animations.
* **Instant Telegram Integration**: Immediate HTML-formatted feedback summaries sent directly to your phone.
* **Anti-Spam Controls**: In-memory IP rate limiter (throttles rapid submissions) and a hidden honeypot blocker to stop bots.
* **Local Persistence**: Writes feedback entries directly to a server-side JSON file (`src/data/feedbacks.json`).
* **Admin Portal**: Accessible at `/admin` to view, filter by rating, search, and sort all feedbacks.
* **CSV Export**: Instantly export and download filtered feedbacks directly to a spreadsheet.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Next.js 16 (App Router), Tailwind CSS v4, Lucide React (Icons)
* **Backend**: Next.js Serverless API Routes (Node.js)
* **Database**: Local JSON-based storage (`feedbacks.json`)

---

## 📁 Project Structure

```text
Assignment 2/
├── .env.local                  # Local environment configuration
├── package.json                # Project dependencies and script runner
├── postcss.config.mjs          # Tailwind v4 PostCSS compiler settings
├── src/
│   ├── data/
│   │   └── feedbacks.json      # Local persistent database
│   ├── app/
│   │   ├── globals.css         # Styling system, glassmorphism and animations
│   │   ├── layout.js           # Base HTML layout and SEO tags
│   │   ├── page.js             # Main landing feedback submission page (Client)
│   │   ├── admin/
│   │   │   └── page.js         # Passcode-protected Admin Dashboard (Client)
│   │   └── api/
│   │       ├── feedback/
│   │       │   └── route.js    # API endpoint to handle submissions, limit rate, notify TG
│   │       └── feedbacks/
│   │           └── route.js    # API endpoint to fetch submissions for Admin
```

---

## ⚙️ Setup and Configuration

### 1. Prerequisite Installations
Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or newer is recommended).

### 2. Configure Environment Variables
1. Rename the `.env.local` template file (or create one in the project root folder).
2. Configure the following keys inside `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
ADMIN_PASSWORD=admin123
```

#### 🤖 How to create a Telegram Bot and get credentials:
1. Open Telegram and search for the verified bot **`@BotFather`**.
2. Click **Start** (or send `/start`) and type **`/newbot`**.
3. Follow the instructions to give your bot a name and a username.
4. Copy the API Token provided (e.g., `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`). This goes into `TELEGRAM_BOT_TOKEN`.
5. Now, search for **`@userinfobot`** (or **`@raw_data_bot`**) on Telegram and send a message.
6. It will reply with your profile details including your **Id** (a sequence of numbers like `987654321`). Copy this ID and paste it into `TELEGRAM_CHAT_ID`.
7. **CRITICAL STEP**: Open a direct chat with your new bot and click **Start** or send a message. Telegram bots cannot send message alerts to users who have not first initiated a conversation!

---

## 🏃 Running the Application

### Install Dependencies
To install all required modules, open your terminal in the project root folder and execute:
```bash
npm install
```

### Run Local Development Server
Launch the compiler and boot up the hot-reload server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the feedback form.
Open **[http://localhost:3000/admin](http://localhost:3000/admin)** to access the password-protected Admin Dashboard.

### Build and Start for Production
Compile optimized build scripts and launch the production node daemon:
```bash
npm run build
npm run start
```
