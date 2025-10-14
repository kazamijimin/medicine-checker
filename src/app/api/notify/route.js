import { NextResponse } from "next/server";

export async function POST(req) {
  const { token, title = "MediChecker", body = "Test push" } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body, icon: "/favicon.ico" },
    }),
  });

  const json = await res.json();
  return NextResponse.json(json, { status: res.ok ? 200 : 500 });
}