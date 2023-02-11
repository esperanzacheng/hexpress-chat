FROM node:alpine
COPY . /letschat
WORKDIR /letschat
CMD npm run start