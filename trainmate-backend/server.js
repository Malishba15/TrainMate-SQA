import app from "./app.js";

import { initPinecone } from "./config/pinecone.js";
import { initializeScheduledJobs } from "./services/scheduledJobs.js";
import { initializeAutonomousAgentRuntime } from "./services/autonomy/runtime/runtime.service.js";

const PORT = process.env.PORT || 5000;

async function initializeBackgroundServices() {
  try {
    await initPinecone();
  } catch (error) {
    console.error("Failed to initialize Pinecone:", error.message);
  }

  try {
    initializeScheduledJobs();
  } catch (error) {
    console.error("Failed to initialize scheduled jobs:", error.message);
  }

  try {
    initializeAutonomousAgentRuntime();
  } catch (error) {
    console.error("Failed to initialize autonomous runtime:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initializeBackgroundServices().catch((error) => {
  console.error("Failed to initialize background services:", error.message);
});