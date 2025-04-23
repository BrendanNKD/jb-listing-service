import fetch from 'node-fetch'

// Fallback to the EC2 metadata IP if ECS metadata URI isn’t set
const IMDS_BASE =
  process.env.ECS_CONTAINER_METADATA_URI_V4 ||
  'http://169.254.169.254/latest'

/**
 * Fetch an IMDSv2 token
 */
export async function fetchImdsToken(): Promise<string> {
  const res = await fetch(`${IMDS_BASE}/api/token`, {
    method: 'PUT',
    headers: { 'X-aws-ec2-metadata-token-ttl-seconds': '21600' }
  })

  if (!res.ok) {
    throw new Error(`IMDS token fetch failed: ${res.status}`)
  }

  return res.text()
}

/**
 * Fetch a metadata path using an IMDSv2 token
 */
export async function fetchMetadata(
  path: string,
  token: string
): Promise<string> {
  const res = await fetch(`${IMDS_BASE}/meta-data${path}`, {
    headers: { 'X-aws-ec2-metadata-token': token }
  })

  if (!res.ok) {
    throw new Error(`IMDS metadata fetch failed (${path}): ${res.status}`)
  }

  return res.text()
}
