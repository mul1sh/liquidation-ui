FROM node:12 as build-deps
WORKDIR /app

ADD package.json package-lock.json /app/
RUN npm ci

# general ETH config
ARG REACT_APP_SUPPORTED_ETHEREUM_NETWORKS
ARG REACT_APP_DEFAULT_ETHEREUM_NETWORK

# ropsten config
ARG REACT_APP_MUTATIONS_API_URL_ROPSTEN
ARG REACT_APP_QUERY_API_URL_ROPSTEN
ARG REACT_APP_WS_API_URL_ROPSTEN
ARG REACT_APP_ETHEREUM_JSONRPC_URL_ROPSTEN
ARG REACT_APP_FORTMATIC_PRODUCT_KEY_ROPSTEN
ARG REACT_APP_WALLET_BALANCE_PROVIDER_ADDRESS_ROPSTEN

# kovan config
ARG REACT_APP_MUTATIONS_API_URL_KOVAN
ARG REACT_APP_QUERY_API_URL_KOVAN
ARG REACT_APP_WS_API_URL_KOVAN
ARG REACT_APP_ETHEREUM_JSONRPC_URL_KOVAN
ARG REACT_APP_FORTMATIC_PRODUCT_KEY_KOVAN
ARG REACT_APP_WALLET_BALANCE_PROVIDER_ADDRESS_KOVAN

# mainnet config
ARG REACT_APP_WALLET_BALANCE_PROVIDER_ADDRESS_KOVAN
ARG REACT_APP_MUTATIONS_API_URL_MAINNET
ARG REACT_APP_QUERY_API_URL_MAINNET
ARG REACT_APP_WS_API_URL_MAINNET
ARG REACT_APP_ETHEREUM_JSONRPC_URL_MAINNET
ARG REACT_APP_FORTMATIC_PRODUCT_KEY_MAINNET
ARG REACT_APP_WALLET_BALANCE_PROVIDER_ADDRESS_MAINNET

ADD .babelrc tsconfig.paths.json tsconfig.json config-overrides.js /app/

ADD ./public /app/public
ADD ./scripts /app/scripts

ADD ./src /app/src
RUN npm run build


FROM nginx:alpine

COPY nginx/config.nginx /etc/nginx/nginx.conf
COPY --from=build-deps /app/build/ /server_root/

ARG NGINX_MODE=prod
RUN if [ "$NGINX_MODE" = "staging" ]; \
      then printf 'User-agent: * \nDisallow: /\n' > /server_root/robots.txt; \
      else printf 'User-agent: * \nAllow: /\n' > /server_root/robots.txt; \
    fi

CMD ["nginx", "-g", "daemon off;"]