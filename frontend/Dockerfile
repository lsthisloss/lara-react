FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy source code
COPY . .

# Ensure .env file exists
RUN if [ ! -f .env ]; then cp .env.example .env; fi

EXPOSE 3000

# Start development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
