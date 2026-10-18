FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG REACT_APP_API_BASE_URL=
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV API_GATEWAY_URL=http://api-gateway:8080
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
