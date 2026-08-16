process.env.TZ = process.env.APP_TZ || "Asia/Jakarta";

import { createApp } from "../backend/dist/app.js";

export default createApp();
