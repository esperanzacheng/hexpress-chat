FROM node:alpine
COPY . /hexpress
WORKDIR /hexpress
RUN npm install
CMD npm run start