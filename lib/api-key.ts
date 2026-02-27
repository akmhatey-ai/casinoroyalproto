import { NextRequest } from "next/server";

const API_KEY_HEADER = "x-api-key";
const API_KEY_ENV = "PROMPT_HUB_API_KEY";

/**
 * Validate optional API key for agent requests.
 * If PROMPT_HUB_API_KEY is set, requests to agent APIs can include X-API-Key header.
 * Returns true if no key is configured (open) or if the header matches.
 */
export function validateApiKey(req: NextRequest): boolean {
  const configured = process.env[API_KEY_ENV];
  if (!configured) return true;
  const provided = req.headers.get(API_KEY_HEADER);
  return provided === configured;
}

export function requireApiKey(req: NextRequest): { valid: boolean; status?: number } {
  if (validateApiKey(req)) return { valid: true };
  return { valid: false, status: 401 };
}
