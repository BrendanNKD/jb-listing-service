import type Elysia from "elysia";
import { Roles } from "../models/roles";
import { fetchImdsToken, fetchMetadata } from "../controllers/imdsToken";

export const commonRoutes = (app: Elysia) => {
      // GET roles array from the JobListing schema
  app.get("/v1/api/roles", () => {
    // Access the enum values from the 'role' field in the schema.
    const roles =
      (Roles.schema.path("role") as any)?.caster?.enumValues || [];
    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  // GET current availability zone
  app.get("/v1/api/availability-zone", async () => {
    try {
      // 1) fetch an IMDSv2 token
      const token = await fetchImdsToken();

      // 2) query the AZ metadata
      // the path here is the IMDS path for AZ
      const az = await fetchMetadata(
        "/latest/meta-data/placement/availability-zone",
        token
      );

      return new Response(
        JSON.stringify({ availabilityZone: az.trim() }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err: any) {
      console.error("Failed to get availability zone:", err);
      return new Response(
        JSON.stringify({ error: "Could not determine availability zone" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });

}