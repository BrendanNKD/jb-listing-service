import { Elysia } from "elysia";
import { connectDB } from "./src/database/mongo";
import { jobListingRoutes } from "./src/routes/jobListingRoutes";
import { healthRoutes } from "./src/routes/healthRoutes";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import dotenv from 'dotenv';

const APP_ENV = process.env.APP_ENV || 'dev';
const APP_PORT = process.env.APP_PORT || 3000
// In development, load local variables from .env
if (APP_ENV === 'dev') {
  dotenv.config();
}

/**
 * Loads production secrets from AWS Secrets Manager.
 * The secret should be a JSON string containing keys:
 * MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, and MONGO_DB.
 */
async function loadProdSecrets() {
  const secretId = process.env.SECRET_ID;
  if (!secretId) {
    throw new Error("Missing SECRET_ID for AWS Secrets Manager.");
  }
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || "us-east-1" });
  const command = new GetSecretValueCommand({ SecretId: secretId });
  const response = await client.send(command);
  if (!response.SecretString) {
    throw new Error("No secret string returned from AWS Secrets Manager.");
  }
  const secret = JSON.parse(response.SecretString);
  // Replace environment variables with the secret values.
  process.env.MONGO_USERNAME = secret.MONGO_USERNAME;
  process.env.MONGO_PASSWORD = secret.MONGO_PASSWORD;
  process.env.MONGO_HOST = secret.MONGO_HOST;
  process.env.MONGO_DB = secret.MONGO_DB;
}

async function startServer() {
  // For production, load secrets from AWS before starting the server.
  if (APP_ENV === 'prod') {
    await loadProdSecrets();
  }

  const app = new Elysia();

  // Register the health routes without protection.
  healthRoutes(app);

  // Apply guard only for the job listing routes.
  app.guard(
    {
      async beforeHandle({ headers, request, error }) {
        console.log("Requested URL:", request.url);
        // Extract the Bearer token from the Authorization header (case-insensitive)
        const authHeader = headers["Authorization"] || headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return error(401, "Missing or invalid token");
        }
        // Remove the "Bearer " prefix to get the token
        const token = authHeader.substring("Bearer ".length);
        try {
          // Call your authentication endpoint.
          const res = await fetch("http://localhost:8080/authenticate", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            return error(res.status);
          }
          const authData = await res.json();
          if (!authData.valid) {
            return error(401, authData.message);
          }
        } catch (err) {
          return error(500, "Error verifying token");
        }
      },
    },
    (guardedApp) => {
      // Only job listing routes are protected by this guard.
      jobListingRoutes(guardedApp as unknown as Elysia<any>);
      return guardedApp;
    }
  );

  app.listen(APP_PORT, () => {
    console.log("Server running on http://localhost:3000");
  });

  // Connect to MongoDB after starting the server.
  await connectDB();
}

startServer().catch(console.error);
