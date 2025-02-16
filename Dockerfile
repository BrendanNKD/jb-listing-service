# Use Bun base image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN bun install

# Expose the server port
EXPOSE 3000

# Run the server
CMD ["bun", "run", "index.ts"]
