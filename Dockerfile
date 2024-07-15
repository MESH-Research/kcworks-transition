FROM node:18-alpine
ENV SQLITE_PATH=/db
ENV JSON_PATH=/import/data.json

WORKDIR /app
RUN mkdir -p /db
COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
