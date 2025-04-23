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

  // 2) GET current availability zone via IMDSv2
  app.get("/v1/api/availability-zone", async () => {
    try {
      const token = await fetchImdsToken();
      const az    = await fetchMetadata("/placement/availability-zone", token);
      return new Response(
        JSON.stringify({ availabilityZone: az }),
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