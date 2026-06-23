FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json ./

RUN pnpm install

COPY . .

RUN pnpm db:generate

EXPOSE 3000

CMD ["pnpm", "start"]