# Use Node.js 18 LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose port (Cloud Run listens on $PORT)
EXPOSE 8080

# Set environment variable
ENV PORT=8080

# Start the app
CMD [ "npm", "start" ]
