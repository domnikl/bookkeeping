ARG NODE_IMAGE=node:23-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init python3 make g++
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS build
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN echo "" > .env && node ace build --production

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
