FROM node:10 as compile-server
WORKDIR /home/inspiron/Documents/zeroToMastery/node-ts-graphql-bolierplate
COPY . .
RUN npm install
RUN npm build

CMD ["npm", "start"]
