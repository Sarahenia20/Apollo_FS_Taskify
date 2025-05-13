# REACT
FROM node:16-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build || echo "Client build failed, but continuing"

# NODEJS
FROM node:16-alpine
WORKDIR /app
COPY --from=client-builder /app/client/build /app/client/build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
ENV CLIENT_BUILD_PATH=/app/client/build
EXPOSE 5000
CMD ["npm", "start"]