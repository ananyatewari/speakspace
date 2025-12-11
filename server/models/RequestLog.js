import mongoose from "mongoose";

const RequestLogSchema = new mongoose.Schema(
  {
    note_id: String,
    prompt: String,
    action: String,
    timestamp: String,
    status: { type: String, default: "received" },
    result: Object,
    error: Object
  },
  { timestamps: true }
);

export default mongoose.model("RequestLog", RequestLogSchema);
