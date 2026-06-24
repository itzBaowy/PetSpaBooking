FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json ./

RUN pnpm install --prod=false

COPY . .

RUN pnpm db:generate

EXPOSE 5500

CMD ["pnpm", "start"]