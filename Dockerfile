# ------------------------------------------------------------------------------
# BUILD STAGE
# ------------------------------------------------------------------------------

FROM node:18-alpine AS build-image

WORKDIR /opt/software

RUN npm install -g @angular/cli
RUN npm install -g nx
RUN npm install -g @nrwl/cli

COPY .eslintrc.json decorate-angular-cli.js jest.config.ts jest.preset.js nx.json \
     package.json tsconfig.base.json ./

COPY apps apps
COPY libs libs

RUN npm install

ENV NX_DAEMON=false

RUN nx run money-tracker-ui:build:${ENVIRONMENT}
RUN nx run-many --target=test --all --coverage --verbose

# ------------------------------------------------------------------------------
# COPY COVERAGE STAGE (after build)
# ------------------------------------------------------------------------------

FROM scratch AS test-out
COPY --from=build-image  /opt/software/coverage .

# ------------------------------------------------------------------------------
# RUNTIME STAGE (deployment)
# ------------------------------------------------------------------------------

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

RUN mkdir -p "$APP_ROOT"
COPY --from=0 $SOURCE_PATH $APP_ROOT
# COPY ./apps/$APP_NAME/jenkins/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN ls -l "$APP_ROOT"

ENTRYPOINT ["/usr/local/openresty/nginx/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
