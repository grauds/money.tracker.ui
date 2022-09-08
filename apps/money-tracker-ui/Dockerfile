FROM node:16-alpine as build

ARG APP_NAME=money-tracker-ui
ARG WORK_DIR=/opt/software
ARG APP_SRC_DIR=$WORK_DIR/apps/$APP_NAME

RUN mkdir -p $APP_SRC_DIR
WORKDIR $WORK_DIR

COPY ./apps/$APP_NAME/*.json $APP_SRC_DIR/
COPY ./apps/$APP_NAME/*.js $APP_SRC_DIR/
COPY ./apps/$APP_NAME/.browserslistrc $APP_SRC_DIR/

COPY *.json $WORK_DIR/
COPY *.js $WORK_DIR/

COPY ./apps/$APP_NAME/src $APP_SRC_DIR/src

RUN echo $(ls -l $APP_SRC_DIR)

RUN npm install
RUN npm install -g @angular/cli
RUN npm install -g nx

RUN nx run money-tracker-ui:build:production --verbose

FROM openresty/openresty:alpine-fat

RUN mkdir /var/log/nginx

RUN apk add --no-cache openssl-dev
RUN apk add --no-cache git
RUN apk add --no-cache gcc
RUN luarocks install lua-resty-openidc

ARG APP_NAME=money-tracker-ui
ARG WORK_DIR=/opt/software
ARG APP_SRC_DIR=$WORK_DIR/$APP_NAME

# Path to copy application from
ARG SOURCE_PATH=$WORK_DIR/dist/apps/$APP_NAME
# Path to application in docker. Used by nginx to serve static
ARG APP_ROOT=/var/www/$APP_NAME

RUN mkdir -p $APP_ROOT
COPY --from=0 $SOURCE_PATH $APP_ROOT
COPY ./apps/$APP_NAME/jenkins/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN ls -l $APP_ROOT

ENTRYPOINT ["/usr/local/openresty/nginx/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
