FROM node:11-alpine
COPY src/app /src/app
COPY entrypoint.sh /entrypoint.sh
RUN npm i axios ethers fs
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
