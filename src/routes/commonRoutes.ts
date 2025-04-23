import type Elysia from "elysia";
import { Roles } from "../models/roles";
import { fetchImdsToken, fetchMetadata } from "../controllers/imdsToken";

export const commonRoutes = (app: Elysia) => {
      // GET roles array from the JobListing schem
  app.get("/v1/api/roles", () => {
    // Access the enum values from the 'role' field in the schema.
    const roles =
      (Roles.schema.path("role") as any)?.caster?.enumValues || [];
    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  // new /az route
  app.get("/v1/api/availability-zone", async () => {
    try {
      let az: string;

      // Fargate metadata v4
      const ecsMetaUri = process.env.AWS_CONTAINER_METADATA_URI_V4;
      console.log(ecsMetaUri)
      if (ecsMetaUri) {
        const res = await fetch(`${ecsMetaUri}/task`);
        if (!res.ok) throw new Error(`ECS metadata error ${res.status}`);
        const data = await res.json() as { AvailabilityZone?: string };
        az = data.AvailabilityZone || "unknown";
      } else {
        // EC2 IMDS v2
        const token = await fetchImdsToken();
        az = await fetchMetadata(token, "placement/availability-zone");
      }

      return new Response(
        JSON.stringify({ availabilityZone: az }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Failed to fetch AZ:", err);
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