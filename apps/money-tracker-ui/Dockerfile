FROM node:16-alpine as build

ARG APP_NAME=money-tracker-ui
ARG APP_SRC_DIR=/opt/software/$APP_NAME

RUN mkdir -p $APP_SRC_DIR
WORKDIR $APP_SRC_DIR

COPY *.json $APP_SRC_DIR/
COPY *.js $APP_SRC_DIR/
COPY .browserslistrc $APP_SRC_DIR/

RUN npm install

COPY src $APP_SRC_DIR/src/

RUN npm install -g @angular/cli
RUN ng build

RUN ls -l $APP_SRC_DIR

FROM openresty/openresty:alpine-fat

RUN mkdir /var/log/nginx

RUN apk add --no-cache openssl-dev
RUN apk add --no-cache git
RUN apk add --no-cache gcc
RUN luarocks install lua-resty-openidc

ARG APP_NAME=money-tracker-ui
ARG APP_SRC_DIR=/opt/software/$APP_NAME

# Path to copy application from
ARG SOURCE_PATH=$APP_SRC_DIR/dist
# Path to application in docker. Used by nginx to serve static
ARG APP_ROOT=/var/www/$APP_NAME

RUN mkdir -p $APP_ROOT
COPY --from=0 $SOURCE_PATH $APP_ROOT
COPY jenkins/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN ls -l $APP_ROOT

ENTRYPOINT ["/usr/local/openresty/nginx/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
