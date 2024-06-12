FROM node:20 as builder
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk add libheif vips vips-dev vips-heif

WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json /app/
RUN npm ci --omit=dev --verbose
ENTRYPOINT [ "npm", "run", "start" ]
