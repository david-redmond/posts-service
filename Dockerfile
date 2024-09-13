# Use a lightweight Node.js image as base
FROM node:16-alpine3.18

# Set the working directory in the container
WORKDIR /usr/src

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

ENV MONGODB_URI=""
ENV PORT=8012

# Copy the rest of the application code to the working directory
COPY . .

RUN npm run build

EXPOSE 8012
# Start the application
CMD ["node", "./dist/index.js"]

