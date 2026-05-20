import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    // 1. Verify Authorization
    const authHeader = req.headers.get("authorization");
    const customHeader = req.headers.get("x-admin-password");
    
    // We will look for ADMIN_PASSWORD in environment variables. If not set, use "admin123" as fallback
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    let isAuthorized = false;
    
    if (customHeader === expectedPassword) {
      isAuthorized = true;
    } else if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
      if (token === expectedPassword) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid passcode." },
        { status: 401 }
      );
    }
    
    // 2. Read feedbacks from local database
    const filePath = path.join(process.cwd(), "src", "data", "feedbacks.json");
    let feedbacks = [];
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        feedbacks = JSON.parse(fileContent || "[]");
      } catch (err) {
        console.error("Error reading feedbacks file:", err);
        return NextResponse.json(
          { error: "Failed to read data from store." },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    console.error("Internal Server Error in GET /api/feedbacks:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
