FROM node:8.10-alpine

MAINTAINER "PhilNing <zh.nifoo@gmail.com>"

VOLUME ["/usr/app"]

COPY ./ /usr/app/

WORKDIR /usr/app/

ENTRYPOINT npm run docker