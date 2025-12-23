# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# VITE_API_URL 환경변수를 빌드 시점에 주입받음
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_CLOUDWATCH_DASHBOARD_URL
ENV VITE_CLOUDWATCH_DASHBOARD_URL=$VITE_CLOUDWATCH_DASHBOARD_URL
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드 결과물 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
