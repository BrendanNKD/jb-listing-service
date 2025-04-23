# Stage 1: Build the application
FROM oven/bun:latest AS builder

# Set working directory inside the builder image
WORKDIR /app

# 0) install unzip so that bun upgrade can actually extract
RUN apk update && apk add --no-cache unzip

# 0) upgrade to canary
RUN bun upgrade --canary

# Copy all project files into the container.
COPY . .

# Install dependencies (bun.lockb and package.json are detected automatically)
RUN bun install


# Build the server file for Node.js using the correct target flag.
RUN bun build server.ts --target=node --outdir dist

# Stage 2: Create the runtime image with the built application
FROM oven/bun:latest

# Set working directory inside the runtime image
WORKDIR /app

# Copy only the build output from the builder stage.
COPY --from=builder /app/dist ./dist

# Expose the port your application listens on (adjust if needed)
EXPOSE 3000

# Run the built application.
CMD ["bun", "run", "dist/server.js"]
