import express from "express";
import mongoose from "mongoose";
import processRoutes from "./routes/process.js";

const app = express();

app.use(express.json());

app.use("/api/process", processRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error", err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
