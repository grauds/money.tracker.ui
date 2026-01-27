# ------------------------------------------------------------------------------
# TEST STAGE
# ------------------------------------------------------------------------------

FROM node:22-bullseye AS test-image

WORKDIR /opt/software

COPY .babelrc .eslintignore .eslintrc.json decorate-angular-cli.js \
     jest.config.ts jest.preset.js nx.json postcss.config.json .postcssrc.json \
     package.json package-lock.json tsconfig.base.json ./

ENV NODE_OPTIONS='--dns-result-order=ipv4first'

RUN npm config set maxsockets 5 \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

RUN npm ci --no-audit --no-fund

COPY apps apps
COPY libs libs

ENV NX_DAEMON=false

RUN npx nx run-many --target=test --all --coverage --runInBand

# ------------------------------------------------------------------------------
# BUILD STAGE
# ------------------------------------------------------------------------------

FROM node:22-bullseye AS build-image

WORKDIR /opt/software

COPY .babelrc .eslintignore .eslintrc.json decorate-angular-cli.js \
     jest.config.ts jest.preset.js nx.json postcss.config.json .postcssrc.json \
     package.json package-lock.json tsconfig.base.json ./

ENV NODE_OPTIONS='--dns-result-order=ipv4first'

RUN npm config set maxsockets 5 \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 2 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

RUN npm ci --no-audit --no-fund

COPY apps apps
COPY libs libs

ENV NX_DAEMON=false

ARG ENVIRONMENT
RUN npx nx run money-tracker-ui:build:${ENVIRONMENT}

# ------------------------------------------------------------------------------
# DEBUG STAGE (after build)
# ------------------------------------------------------------------------------

#FROM build-image AS debug
#CMD ["/bin/sh"]

# ------------------------------------------------------------------------------
# COPY COVERAGE STAGE (after build)
# ------------------------------------------------------------------------------

FROM scratch AS test-out
COPY --from=test-image  /opt/software/coverage .

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

RUN mkdir -p /usr/local/openresty/nginx/ssl
RUN mkdir -p "$APP_ROOT"

COPY --from=build-image $SOURCE_PATH $APP_ROOT
# COPY ./apps/$APP_NAME/jenkins/nginx-default.conf /etc/nginx/conf.d/default.conf

RUN ls -l "$APP_ROOT"

ENTRYPOINT ["/usr/local/openresty/nginx/sbin/nginx", "-g", "daemon off;"]
EXPOSE 80
