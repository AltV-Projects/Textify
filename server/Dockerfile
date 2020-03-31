FROM node:lts

WORKDIR /app

COPY . .

RUN npm i -g typescript
RUN npm install
RUN npm run build
RUN npm uninstall -g typescript

CMD [ "node", "./dist/main.js" ]