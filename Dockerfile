FROM registry.scontain.com:5050/sconecuratedimages/apps:node-10.14-alpine

RUN apk add bash nodejs-npm
RUN SCONE_MODE=sim npm install axios@0.21.x ethers@5.0.x

COPY ./src/app /app

COPY ./protect-fs.sh ./Dockerfile /build/
RUN sh /build/protect-fs.sh /app

ENTRYPOINT [ "node", "/app/index.js"]
