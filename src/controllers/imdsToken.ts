import http from "http";

const IMDS_HOST = "169.254.169.254";
const TOKEN_PATH = "/latest/api/token";
const METADATA_BASE = "/latest/meta-data";

export async function fetchImdsToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: IMDS_HOST,
        path: TOKEN_PATH,
        method: "PUT",
        headers: {
          "X-aws-ec2-metadata-token-ttl-seconds": "60",
        },
        timeout: 1000,
      },
      (res) => {
        let token = "";
        res.on("data", (chunk) => (token += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(token);
          } else {
            reject(
              new Error(
                `IMDS token fetch failed with status ${res.statusCode}`
              )
            );
          }
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
        host: IMDS_HOST,
        path: `${METADATA_BASE}${path}`,
        method: "GET",
        headers: {
          "X-aws-ec2-metadata-token": token,
        },
        timeout: 1000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(
              new Error(
                `Metadata fetch failed with status ${res.statusCode}`
              )
            );
          }
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
