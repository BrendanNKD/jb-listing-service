import { Elysia } from "elysia";
import { connectDB } from "./src/database/mongo";
import { jobListingRoutes } from "./src/routes/jobListingRoutes";
import { healthRoutes } from "./src/routes/healthRoutes";

new Elysia()
  .guard(
    {
      // The guard checks the session cookie before handling the request.
      async beforeHandle({ set, headers, request, error }) {
        console.log("Requested URL:", request.url);
        // Extract the Bearer token from the Authorization header (case-insensitive)
        const authHeader = headers["Authorization"] || headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return error(401, "Missing or invalid token");
        }

        // Remove the "Bearer " prefix to get the token
        const token = authHeader.substring("Bearer ".length);

        try {
          // Call your authentication endpoint (which returns JSON with properties: valid, message, username, role)
          const res = await fetch("http://localhost:8080/authenticate", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            return error(401, "Invalid token");
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
    (app) => {
      // You can also register additional groups of routes.
      jobListingRoutes(app as unknown as Elysia<any>);
      healthRoutes(app as unknown as Elysia<any>);
      return app;
    }
  )
  .listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });

// Connect to the database before handling requests.
await connectDB();
