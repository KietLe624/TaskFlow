const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.user_id;
      if (!userId) {
        return res.status(401).json({ error: "Chưa đăng nhập" });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Không có quyền truy cập" });
      }
    } catch (error) {
      console.error("Lỗi trong middleware vai trò:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
  };
};
