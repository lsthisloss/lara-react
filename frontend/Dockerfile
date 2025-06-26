FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
