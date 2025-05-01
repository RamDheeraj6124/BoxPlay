# Use the official Node.js 20 image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Ensure react-scripts has execute permissions
RUN chmod +x node_modules/.bin/react-scripts

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000 for the React app
EXPOSE 3000

# Start React app when the container starts
CMD ["npm", "start"]
