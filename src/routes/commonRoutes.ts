import type Elysia from "elysia";
import { Roles } from "../models/roles";

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
}