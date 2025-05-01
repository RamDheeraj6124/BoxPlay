# Build stage
FROM node:20 as build

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build

# Production stage
FROM node:20 as production

WORKDIR /app

# Install serve to serve the build folder
RUN npm install -g serve

# Copy build folder from previous stage
COPY --from=build /app/build ./build

# Expose the port serve will use
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
