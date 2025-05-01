FROM node:20

WORKDIR /app

# Copy package files and install dependencies using npm ci
COPY package*.json ./
RUN npm cache clean --force && npm ci

# Ensure react-scripts has execute permissions
RUN chmod -R 777 node_modules

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Start React app when the container starts
CMD ["npm", "start"]
