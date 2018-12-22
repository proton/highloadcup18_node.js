FROM mhart/alpine-node:11

RUN apk add zip

RUN mkdir /app /data
WORKDIR /app

ADD package.json yarn.lock ./
RUN yarn install

ADD src ./src

EXPOSE 80

CMD [ "yarn", "start" ]