import express from "express";
import RequestLog from "../models/RequestLog.js";
import { generateContent } from "../services/groq.js";
import { publishToWordPress } from "../services/wordpressAdapter.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("🔐 Incoming headers:", req.headers);

  const apiKey = req.headers["x-api-key"];
  const authHeader = req.headers["authorization"];
  const expected = process.env.SPEAKSPACE_SHARED_KEY;

  if (apiKey && apiKey === expected) {
    console.log("✔ Authenticated via x-api-key");
    return next();
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token === expected) {
      console.log("✔ Authenticated via Bearer token");
      return next();
    }
  }

  console.log("❌ AUTH FAILED. Expected:", expected);
  return res.status(401).json({ status: "error", message: "Unauthorized" });
});


router.post("/", async (req, res) => {
  try {
    console.log("📩 Incoming SpeakSpace Payload:", req.body);

    const { prompt, note_id, timestamp, title = "Untitled Post" } = req.body;

    if (!prompt || !note_id) {
      console.log("❌ Missing fields");
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: prompt, note_id",
      });
    }

    const log = await RequestLog.create({
      note_id,
      timestamp,
      prompt,
      action: "speakspace_workflow",
      status: "processing"
    });

    console.log("🗂 DB Entry Created:", log._id);

    console.log("📤 Responding to SpeakSpace...");
    res.json({ status: "success" });

    console.log("🤖 Running AI generation...");
    const generated = await generateContent(prompt);

    console.log("📝 Generated Minimal Content:", generated.substring(0, 200));

    console.log("🌐 Attempting WordPress publish...");
    const wpResult = await publishToWordPress({
      title,
      htmlContent: generated
    });

    log.status = "done";
    log.result = {
      generated,
      wordpress: wpResult || { status: "skipped", message: "WP not configured" }
    };

    await log.save();
    console.log("✅ Workflow updated in DB");

  } catch (err) {
    console.error("❌ Workflow error:", err);
  }
});

export default router;
