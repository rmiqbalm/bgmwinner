import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "bgm-winner-secret";

export interface TokenPayload {
  id: number;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}
