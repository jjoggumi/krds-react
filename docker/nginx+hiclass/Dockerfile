FROM node:22.17.0-alpine3.21 AS builder

WORKDIR /app/build

COPY . .

RUN npm install
RUN npx vue-cli-service build --mode production --dest /app/dist

FROM nginx:1.27-alpine

RUN apk update && apk upgrade

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /home

RUN mkdir -p /etc/nginx/conf.d
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen       80;
  server_name  localhost;

  root   /home;
  index  index.html;

  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]