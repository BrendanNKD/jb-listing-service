import http from "http";

export async function fetchImdsToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "169.254.169.254",
          path: "/latest/api/token",
          method: "PUT",
          headers: { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
          timeout: 1000,
        },
        (res) => {
          let token = "";
          res.on("data", (chunk) => (token += chunk));
          res.on("end", () => {
            if (res.statusCode === 200) resolve(token);
            else reject(new Error(`Token fetch failed: ${res.statusCode}`));
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
  
 export async function fetchMetadata(path: string, token: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: "169.254.169.254",
          path,
          method: "GET",
          headers: { "X-aws-ec2-metadata-token": token },
          timeout: 1000,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (res.statusCode === 200) resolve(data);
            else reject(new Error(`Metadata fetch failed: ${res.statusCode}`));
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