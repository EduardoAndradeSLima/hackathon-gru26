FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY uploads/.gitkeep ./uploads/.gitkeep

ENV NODE_ENV=production
EXPOSE 3333

CMD ["npm", "start"]
