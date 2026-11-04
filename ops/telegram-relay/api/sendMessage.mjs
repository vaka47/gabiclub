import { createHash, timingSafeEqual } from "node:crypto";

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  const secret = process.env.TELEGRAM_RELAY_TOKEN;
  const supplied = request.headers.authorization ?? "";
  const digest = (value) => createHash("sha256").update(value).digest();
  if (!secret || !timingSafeEqual(digest(supplied), digest(`Bearer ${secret}`))) {
    return response.status(401).json({ ok: false, description: "Unauthorized" });
  }
  if (request.method !== "POST") return response.status(405).json({ ok: false });
  if (Number(request.headers["content-length"]) > 32768) {
    return response.status(413).json({ ok: false });
  }
  let payload;
  try {
    payload = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return response.status(400).json({ ok: false, description: "Invalid JSON" });
  }
  const { token, chat_id, text, parse_mode = "HTML" } = payload ?? {};
  if (typeof token !== "string" || !/^\d+:[A-Za-z0-9_-]+$/.test(token) ||
      typeof chat_id !== "string" || !/^(?:-?\d+|@[A-Za-z0-9_]+)$/.test(chat_id) ||
      typeof text !== "string" || !text || text.length > 4096 || parse_mode !== "HTML") {
    return response.status(400).json({ ok: false, description: "Invalid message" });
  }
  try {
    const upstream = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text, parse_mode, disable_web_page_preview: true }),
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    const result = await upstream.json();
    if (!upstream.ok || result.ok !== true) {
      return response.status(upstream.ok ? 502 : upstream.status).json({
        ok: false, error_code: result.error_code, description: "Telegram rejected message",
        parameters: result.parameters,
      });
    }
    return response.status(200).json({ ok: true, result: { message_id: result.result.message_id } });
  } catch {
    // Never log upstream URLs, bot tokens, chat IDs, or applicant details.
    return response.status(502).json({ ok: false, description: "Telegram connection failed" });
  }
}
