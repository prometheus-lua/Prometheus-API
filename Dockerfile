# Build
FROM node:16.13.0 as BUILD

WORKDIR /usr/app
COPY ./ /usr/app

RUN npm install -s
RUN npx tsc

# Run
FROM node:16.13.0

WORKDIR /usr/app
COPY package.json .

RUN npm install --production -s
COPY --from=BUILD /usr/app/dist ./dist
COPY --from=BUILD /usr/app/.env ./.env

COPY --from=BUILD /usr/app/temp.json ./temp.json
COPY --from=BUILD /usr/app/temp-oilld.json ./temp-oilld.json

CMD ["node", "dist/index.js"]