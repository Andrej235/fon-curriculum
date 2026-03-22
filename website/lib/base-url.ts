export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(
  /\/+$/,
  "",
) as string; // Remove trailing slashes
if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
