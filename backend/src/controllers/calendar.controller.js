const calendarService = require("../services/calendar.service");

const getCalendarTasks = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ token
    const { startDate, endDate, projectId } = req.query; // Lấy từ URL

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu startDate hoặc endDate" });
    }

    const result = await calendarService.getTasksForCalendar({
      userId,
      startDate,
      endDate,
      projectId,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCalendarTasks,
};
