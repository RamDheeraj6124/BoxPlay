FROM node:20

WORKDIR /app

# Copy everything first
COPY . .

# Install dependencies
RUN npm ci

# Optional debug: ensure react-scripts is present
RUN ls -l node_modules/.bin && node_modules/.bin/react-scripts --version

# Build the React app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
