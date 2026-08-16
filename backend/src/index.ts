import { createApp } from "./app.js";
import { startAutoLeaveJob } from "./jobs/autoleave.js";

process.env.TZ = process.env.APP_TZ || "Asia/Jakarta";

const PORT = parseInt(process.env.PORT || "3001", 10);
const app = createApp();

app.listen(PORT, () => {
  console.log(`BGM Winner API berjalan di http://localhost:${PORT}`);
  startAutoLeaveJob();
});
