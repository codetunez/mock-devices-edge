FROM node:12

WORKDIR /usr
COPY package*.json ./
RUN npm install
COPY . ./
CMD [ "node", "./main.js" ]
EXPOSE 9005