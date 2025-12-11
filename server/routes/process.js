import express from "express";
import RequestLog from "../models/RequestLog.js";
import { generateContent } from "../services/groq.js";
import { publishToWordPress } from "../services/wordpressAdapter.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("🔐 Incoming headers:", req.headers);

  const expected = process.env.SPEAKSPACE_SHARED_KEY;
  const apiKey = req.headers["x-api-key"];
  const authHeader = req.headers["authorization"];

  if (apiKey === expected) {
    console.log("✔ Authenticated via x-api-key");
    return next();
  }

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token === expected) {
      console.log("✔ Authenticated via Bearer token");
      return next();
    }
  }

  console.log("❌ AUTH FAILED. Expected key:", expected);
  return res.status(401).json({ status: "error", message: "Unauthorized" });
});

router.post("/", async (req, res) => {
  try {
    console.log("📩 Incoming SpeakSpace Payload:", req.body);

    const { prompt, title = "Untitled Post" } = req.body;

    if (!prompt) {
      console.log("❌ Missing prompt");
      return res.status(400).json({
        status: "error",
        message: "Missing required field: prompt",
      });
    }

    const safeNoteId = `note-${Date.now()}`;
    const safeTimestamp = new Date().toISOString();

    const log = await RequestLog.create({
      note_id: safeNoteId,
      timestamp: safeTimestamp,
      prompt,
      action: "speakspace_workflow",
      status: "processing",
    });

    console.log("🗂 DB Entry Created:", log._id);

    res.json({ status: "success" });
    console.log("📤 Responded to SpeakSpace");

    console.log("🤖 Running AI generation...");
    const generated = await generateContent(prompt);

    console.log("📝 Minimal Generated Output:", generated.substring(0, 150));

    let wpResult = { status: "skipped", message: "WP not configured" };

    try {
      wpResult = await publishToWordPress({
        title,
        htmlContent: generated,
      });
    } catch (wpErr) {
      console.log("⚠ WordPress publish failed:", wpErr.message);
    }

    log.status = "done";
    log.result = { generated, wordpress: wpResult };
    await log.save();

    console.log("✅ Workflow updated in DB");

  } catch (err) {
    console.error("❌ Workflow error:", err);
  }
});

export default router;
