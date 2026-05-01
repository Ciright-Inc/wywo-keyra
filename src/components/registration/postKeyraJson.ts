export async function postKeyraJson(
  path: string,
  body: Record<string, unknown>,
): Promise<{ message: string }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Request failed.");
  }
  return { message: data.message ?? "Thank you." };
}
