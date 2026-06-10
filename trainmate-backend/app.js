import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import "./config/firebase.js";

import companyRoutes from "./routes/companyRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import ingestRoutes from "./routes/ingestroutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import chatRoute from "./routes/chatRoutes.js";
import companyFresherChatRoutes from "./routes/companyFresherChatRoutes.js";
import moduleExplain from "./routes/moduleExplain.js";
import quizRoutes from "./routes/quizRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiInsightsRoutes from "./routes/aiInsightsRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "trainmate-backend",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "TrainMate backend is running",
  });
});

app.use("/api", superAdminRoutes);
app.use("/api", companyRoutes);
app.use("/api", ingestRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api", chatRoute);
app.use("/api/company-chat", companyFresherChatRoutes);
app.use("/api/module", moduleExplain);
app.use("/api", quizRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", notificationRoutes);
app.use("/api", aiInsightsRoutes);
app.use("/api", emailRoutes);

export default app;