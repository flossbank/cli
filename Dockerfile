FROM node:12-alpine

USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node package*.json /home/node/app/
RUN npm install

COPY --chown=node . /home/node/app/

RUN npm run build
