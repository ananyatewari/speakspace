import express from "express";
import RequestLog from "../models/RequestLog.js";
import { generateContent } from "../services/groq.js";
import { publishToWordPress } from "../services/wordpressAdapter.js";

const router = express.Router();

router.use((req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key !== process.env.SPEAKSPACE_SHARED_KEY) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  next();
});

router.post("/", async (req, res) => {
  try {
    const { prompt, note_id, timestamp, title = "Untitled Post" } = req.body;

    if (!prompt || !note_id) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: prompt, note_id",
      });
    }

    console.log("Received SpeakSpace payload:", {
      note_id,
      timestamp,
    });

    const log = await RequestLog.create({
      note_id,
      timestamp,
      prompt,
      action: "speakspace_workflow",
      status: "processing",
    });

    console.log("Responding to SpeakSpace in minimal text:", {
      status: "success",
    });

    res.json({ status: "success" });

    const finalPrompt = prompt;

    const generated = await generateContent(finalPrompt);

    const wpResult = await publishToWordPress({
      title,
      htmlContent: generated,
    });

    log.status = "done";
    log.result = {
      generated,
      wordpress: wpResult,
    };

    await log.save();
  } catch (err) {
    console.error("Workflow error:", err.message);
  }
});

export default router;
