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

  app.get("/v1/api/alb-zone", async () => {
    try {
      const token = await fetchImdsToken();
      const az = await fetchMetadata("/latest/meta-data/placement/availability-zone", token);
      return new Response(
        JSON.stringify({ availabilityZone: az }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || "Could not fetch availability zone" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }
  });

}