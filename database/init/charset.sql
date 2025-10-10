-- Đảm bảo charset/colllation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

CREATE DATABASE IF NOT EXISTS taskflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow;
