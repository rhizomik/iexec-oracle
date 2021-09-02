FROM node:14-alpine3.11

RUN mkdir /app && cd /app && npm install axios@0.21.x ethers@5.0.x

COPY ./src/app /app

ENTRYPOINT [ "node", "/app/index.js"]
