# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:4000/api
ARG REACT_APP_API_BASE_URL=http://localhost:4000
ARG REACT_APP_FILES_ENDPOINT_URL=

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_FILES_ENDPOINT_URL=$REACT_APP_FILES_ENDPOINT_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
