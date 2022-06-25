FROM node:16

WORKDIR /triple/

COPY ./package.json /triple/
COPY ./yarn.lock /triple/

RUN yarn install
COPY . /triple
CMD yarn start:dev