# Use the official Node.js 20 Alpine image for a small footprint
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite frontend and compile the Express backend
RUN npm run build

# Expose the port the app runs on (Cloud Run expects apps to listen on the PORT env var, defaults to 3000 in our app)
EXPOSE 3000

# Start the compiled Express server
CMD ["npm", "start"]
