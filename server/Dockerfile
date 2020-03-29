FROM node:lts

WORKDIR /app

COPY . .

RUN npm i -g typescript
RUN npm install
RUN npm run build

CMD [ "node", "./dist/main.js" ]