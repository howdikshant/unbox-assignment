FROM node:20-alpine

WORKDIR /app

# copy package files first for better layer caching
COPY package*.json ./

RUN npm install

# then copy the rest of the source
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
