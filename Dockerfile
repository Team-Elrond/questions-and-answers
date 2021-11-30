FROM node:fermium-alpine as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install --prod

FROM gcr.io/distroless/nodejs:14

WORKDIR /app

COPY --from=build /app .

COPY app.js .
COPY sql.js .
ADD routes routes

ARG HTTP_PORT=80
ENV HTTP_PORT=${HTTP_PORT}
EXPOSE ${HTTP_PORT}

CMD ["app.js"]
