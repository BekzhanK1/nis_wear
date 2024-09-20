# Step 1: Use a node base image
FROM node:16

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

# Expose port 3000 for the React dev server
EXPOSE 3000

CMD ["npm", "start"]
