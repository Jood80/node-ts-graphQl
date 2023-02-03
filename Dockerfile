FROM node:10 as compile-server
WORKDIR .
COPY package*.json ./
RUN npm install
RUN npm build
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
