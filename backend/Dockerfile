FROM node:15-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app

EXPOSE 5000
CMD npm run production