import { Elysia } from "elysia";

// Create the server
const app = new Elysia()
    // Health check endpoint with explicit 200 status
    .get("/health", ({ set }) => {
        return {
            status: "ok",
            uptime: process.uptime(),
            message: "Healthy"
        };
    })

    // Main route
    .get("/api/v1/health", ({ set }) => {
        return {
            message: "Welcome to the Bun Elysia server!"
        };
    })

    // Start the server
    .listen(3000);

console.log(`🦊 Elysia server running at http://localhost:3000`);
