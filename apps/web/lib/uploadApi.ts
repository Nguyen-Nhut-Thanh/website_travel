export async function uploadAuthenticatedFile(
  url: string,
  token: string,
  file: File,
  fallbackMessage: string,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string; url?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      data?.message && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data;
}
