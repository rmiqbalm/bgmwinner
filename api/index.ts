process.env.TZ = process.env.APP_TZ || "Asia/Jakarta";

import type { Express } from "express";
import type { Request, Response } from "express";

let appPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = import("../backend/dist/app.js").then((mod) => mod.createApp());
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}
