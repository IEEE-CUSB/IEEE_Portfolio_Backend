FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including dev tools) so migrations can run
RUN npm ci

COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 3000

# Start script: Run migrations first, then start the server!
CMD npm run migration:run && npm run start:prod
