# 1. Use Node.js base image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of your app (controllers, models, views, public, etc.)
COPY . .

# 5. Your backend runs on 3000
EXPOSE 3000

# 6. Start the server
CMD ["node", "app.js"] 
