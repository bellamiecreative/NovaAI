import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";

const COOKIE_NAME = "novaai_session";

export async function getOrCreateUser() {
  const store = await cookies();
  let sessionId = store.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    store.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return db.user.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
  });
}
