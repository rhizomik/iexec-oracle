FROM registry.scontain.com:5050/sconecuratedimages/apps:node-10.14-alpine

RUN apk add bash nodejs-npm
RUN SCONE_MODE=sim npm install figlet@1.x

WORKDIR /app
COPY src/app .
RUN npm i axios ethers fs

###  protect file system with Scone
WORKDIR /
COPY ./protect-fs.sh ./Dockerfile /build/
RUN sh /build/protect-fs.sh /app

ENTRYPOINT [ "node", "/app/index.js"]
