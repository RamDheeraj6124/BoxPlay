FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all the files
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 3000

# Start React app
CMD ["npm", "start"]