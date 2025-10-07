# ========================
# GIAI ĐOẠN 1: BUILD ANGULAR (Node.js Build Environment)
# ========================
FROM node:20 AS build

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép toàn bộ source code
COPY . .

# Chạy build. Đảm bảo bạn đã tắt Prerendering trong angular.json để tránh lỗi NG0401
RUN npx ng build --configuration=production


# ========================
# GIAI ĐOẠN 2: RUNTIME (Node.js Production Environment)
# ========================
FROM node:20-slim

# Thiết lập thư mục làm việc chính
WORKDIR /usr/src/app

# Sao chép các tệp cần thiết từ giai đoạn build
# CHÚ Ý: ĐÃ SỬA ĐƯỜNG DẪN TỪ ${NG_APP_NAME} THÀNH "frontend"

# 1. Sao chép tệp server và runtime dependencies
# Đường dẫn: /app/dist/<tên_dự_án>/server
COPY --from=build /app/dist/frontend/server /usr/src/app/server

# 2. Sao chép các tệp tĩnh (Browser bundles)
# Đường dẫn: /app/dist/<tên_dự_án>/browser
COPY --from=build /app/dist/frontend/browser /usr/src/app/browser

# 3. Sao chép package.json để cài đặt các Production dependencies
COPY package.json .
RUN npm install --only=production

# Mở cổng mặc định của Angular SSR server (thường là 4000)
EXPOSE 4000

# Lệnh khởi chạy server Node.js đã build
CMD ["node", "server/server.mjs"]
