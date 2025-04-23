import http from "http";

const IMDS_HOST = "169.254.169.254";
const IMDS_PORT = 80;                           // ← HTTP always runs on 80
const TOKEN_PATH = "/latest/api/token";
const METADATA_BASE = "/latest/meta-data";

export async function fetchImdsToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: IMDS_HOST,                    // ← no protocol here
        port:     IMDS_PORT,                    // ← explicitly port 80
        path:     TOKEN_PATH,                   // ← only the “/latest/…” portion
        method:   "PUT",
        headers:  { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
        timeout:  1000,
      },
      (res) => {
        let token = "";
        res.on("data", (c) => (token += c));
        res.on("end", () => {
          if (res.statusCode === 200) resolve(token.trim());
          else
            reject(
              new Error(`IMDS token fetch failed: ${res.statusCode}`)
            );
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("IMDS token request timed out"));
    });
    req.end();
  });
}

export async function fetchMetadata(
  path: string,
  token: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: IMDS_HOST,
        port:     IMDS_PORT,
        path:     `${METADATA_BASE}${path}`,     // e.g. "/latest/meta-data/placement/availability-zone"
        method:   "GET",
        headers:  { "X-aws-ec2-metadata-token": token },
        timeout:  1000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode === 200) resolve(data.trim());
          else
            reject(
              new Error(`Metadata fetch failed: ${res.statusCode}`)
            );
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Metadata request timed out"));
    });
    req.end();
  });
}
