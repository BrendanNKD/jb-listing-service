const IMDS_BASE = "http://169.254.169.254/latest";

export async function fetchImdsToken(): Promise<string> {
  const res = await fetch(`${IMDS_BASE}/api/token`, {
    method:  "PUT",
    headers: { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
    // Bun’s fetch doesn’t support timeout natively; you can wrap with AbortController if you need it
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  return (await res.text()).trim();
}

export async function fetchMetadata(
  path: string,
  token: string
): Promise<string> {
  const res = await fetch(`${IMDS_BASE}/meta-data${path}`, {
    method:  "GET",
    headers: { "X-aws-ec2-metadata-token": token },
  });
  if (!res.ok) throw new Error(`Metadata fetch failed: ${res.status}`);
  return (await res.text()).trim();
}
