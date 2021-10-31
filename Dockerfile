FROM node:14-alpine
ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /usr/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "npm", "run", "start" ]
