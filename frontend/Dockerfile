# ========================
# GIAI ĐOẠN 1: BUILD (Node.js)
# ========================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package trước để tận dụng cache
COPY package.json package-lock.json ./
RUN npm install

# Copy source code và build
COPY . .
RUN npx ng build --configuration=production

# ========================
# GIAI ĐOẠN 2: SERVE (Nginx)
# ========================
FROM nginx:alpine

# Xóa config mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy file build tĩnh từ giai đoạn 1 sang thư mục html của Nginx
# Lưu ý: Kiểm tra kỹ đường dẫn này. Với Angular mới, nó thường là dist/frontend/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy file cấu hình Nginx tùy chỉnh (Để xử lý Routing Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx chạy cổng 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
