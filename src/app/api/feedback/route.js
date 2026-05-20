import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory store for rate limiting (wipes on restart, perfect for basic server rate limits)
// Key: IP, Value: Array of timestamps of recent requests
const ipRequests = new Map();
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

// Helper to escape HTML characters for Telegram HTML parse mode
function escapeHtml(text) {
  if (!text) return "";
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req) {
  try {
    // 1. Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // 2. Apply rate limiting
    const now = Date.now();
    let timestamps = ipRequests.get(ip) || [];
    
    // Filter timestamps older than the window
    timestamps = timestamps.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
    
    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const waitTimeMinutes = Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000 / 60);
      return NextResponse.json(
        { error: `Too many submissions. Please wait ${waitTimeMinutes} minute(s) before trying again.` },
        { status: 429 }
      );
    }
    
    // 3. Parse request body
    const body = await req.json();
    const { name, email, rating, feedback, website_honey } = body;
    
    // 4. Honeypot check (Spam prevention)
    // Bots usually fill all fields, including hidden ones. If this is filled, we fail silently or return a mock success
    if (website_honey) {
      console.warn("Honeypot triggered by submission from IP:", ip);
      return NextResponse.json(
        { message: "Feedback submitted successfully (spam blocked)" },
        { status: 200 }
      );
    }
    
    // 5. Input Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5." }, { status: 400 });
    }
    
    if (!feedback || typeof feedback !== "string" || feedback.trim() === "") {
      return NextResponse.json({ error: "Feedback message is required." }, { status: 400 });
    }
    
    // Record this successful request timestamp
    timestamps.push(now);
    ipRequests.set(ip, timestamps);
    
    // 6. Database Storage (Append to local file feedbacks.json)
    const filePath = path.join(process.cwd(), "src", "data", "feedbacks.json");
    let feedbacks = [];
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        feedbacks = JSON.parse(fileContent || "[]");
      } catch (err) {
        console.error("Error reading feedbacks file, resetting to empty:", err);
      }
    }
    
    const newFeedback = {
      id: now.toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.trim(),
      rating: parsedRating,
      feedback: feedback.trim(),
      createdAt: new Date().toISOString()
    };
    
    feedbacks.unshift(newFeedback); // Newest feedback first
    fs.writeFileSync(filePath, JSON.stringify(feedbacks, null, 2), "utf-8");
    
    // 7. Format Date for Telegram
    // Format: 20 May 2026, 7:30 PM (matching user's local timezone style or server's current date/time)
    const submissionDate = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata" // Matching user's local timezone (IST) for exact consistency
    });
    const formattedTime = formatter.format(submissionDate);
    
    // 8. Telegram Integration
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (botToken && chatId) {
      // Escape HTML entities to prevent Telegram parse errors
      const escName = escapeHtml(newFeedback.name);
      const escEmail = escapeHtml(newFeedback.email);
      const escRating = newFeedback.rating;
      const escFeedback = escapeHtml(newFeedback.feedback);
      const escTime = escapeHtml(formattedTime);
      
      const messageText = `📩 <b>New Feedback Received</b>\n\n👤 <b>Name:</b> ${escName}\n📧 <b>Email:</b> <a href="mailto:${escEmail}">${escEmail}</a>\n⭐ <b>Rating:</b> ${escRating}/5\n💬 <b>Feedback:</b> ${escFeedback}\n🕒 <b>Time:</b> ${escTime}`;
      
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const telegramRes = await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: "HTML",
            disable_web_page_preview: true
          })
        });
        
        if (!telegramRes.ok) {
          const errData = await telegramRes.json();
          console.error("Telegram API returned error:", errData);
        }
      } catch (err) {
        console.error("Failed to send telegram message:", err);
      }
    } else {
      console.warn("Telegram Bot Token or Chat ID not configured. Skipping Telegram notification.");
    }
    
    return NextResponse.json(
      { message: "Feedback submitted successfully!", data: newFeedback },
      { status: 200 }
    );
  } catch (error) {
    console.error("Internal Server Error in POST /api/feedback:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
