# Stage 1: Build the application
FROM oven/bun:latest AS builder

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies
RUN bun install

# Run the build script (make sure your package.json has a "build" script)
RUN bun run build

# Stage 2: Run the built application
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy only the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port (adjust if needed)
EXPOSE 3000

# Run the built application. Adjust the command if your output file has a different name.
CMD ["bun", "run", "dist/index.js"]