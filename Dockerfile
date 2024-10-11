# Use Debian-based Node.js image instead of Alpine
FROM node:lts-buster-slim

# Set working directory
WORKDIR /usr/src/app

# Install necessary build tools and dependencies for sharp
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  libc6-dev \
  libvips-dev

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies, including sharp
RUN npm install --include=optional

# Copy the rest of the application code
COPY . .

# Expose the necessary port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "dev"]
