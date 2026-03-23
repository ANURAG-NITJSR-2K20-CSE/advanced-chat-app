FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY backend ./backend

ENV NODE_ENV=development
EXPOSE 5000

CMD ["node", "backend/index.js"]
