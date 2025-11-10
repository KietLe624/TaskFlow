const teamService = require("../services/team.service");
const chatService = require("../services/chat.service");

// create team
const createTeam = async (req, res) => {
  try {
    const owner_team_id = req.user?.user_id; // lấy từ token
    const { team_name } = req.body;

    // Kiểm tra đầu vào cơ bản
    if (!team_name || team_name.trim() === "") {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }

    // Truyền đúng key xuống service
    const newTeam = await teamService.createTeam({ team_name, owner_team_id });

    res.status(201).json({
      message: "Tạo nhóm thành công",
      team: newTeam,
    });
  } catch (error) {
    console.error("Lỗi khi tạo team (Controller):", error.message);
    res.status(400).json({ message: error.message });
  }
};

// update team
const updateTeam = async (req, res) => {
  try {
    const { team_id } = req.params;
    const { team_name } = req.body;
    const owner_team_id = req.user?.user_id;

    if (!team_name || team_name.trim() === "") {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }

    const updatedTeam = await teamService.updateTeam({
      team_id,
      team_name,
      owner_team_id,
    });

    res.status(200).json({
      message: "Cập nhật nhóm thành công",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật team (Controller):", error.message);
    res.status(400).json({ message: error.message });
  }
};

// delete team
const deleteTeam = async (req, res) => {
  try {
    const { team_id } = req.params; // ✅ lấy giá trị thật
    const owner_team_id = req.user?.user_id;

    if (!team_id) {
      return res.status(400).json({ message: "team_id không được để trống" });
    }

    await teamService.deleteTeam({ team_id, owner_team_id }); // ✅ truyền object đúng định dạng
    res.status(200).json({ message: "Xóa nhóm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa team (Controller):", error.message);
    res.status(400).json({ message: error.message });
  }
};

// get team
const getAllTeamsByOwner = async (req, res) => {
  try {
    const owner_team_id = req.user?.user_id;
    const teams = await teamService.getAllTeamsByOwner(owner_team_id);
    res.status(200).json({ teams });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhóm (Controller):", error.message);
    res.status(400).json({ message: error.message });
  }
};

// get info members in team
const getTeamMembers = async (req, res) => {
  try {
    const { team_id } = req.params;
    if (!team_id) {
      return res.status(400).json({ message: "team_id không được để trống" });
    }
    const team = await teamService.getTeamMembers(team_id);
    res.status(200).json({ team });
  } catch (error) {
    console.error("Lỗi khi lấy thành viên nhóm (Controller):", error.message);
    res.status(400).json({ message: error.message });
  }
};

// invite member to team
const inviteMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;
    const owner_team_id = req.user?.user_id; // Lấy từ token

    const result = await teamService.inviteMember({
      team_id,
      user_id,
      owner_team_id,
    });
    res
      .status(200)
      .json({ message: "Mời thành viên thành công", data: result });
  } catch (error) {
    console.error("Lỗi khi mời thành viên:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// xoá thành viên khỏi team (chỉ owner mới có quyền xoá)
const removeMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;
    const owner_team_id = req.user?.user_id; // Lấy từ token
    const result = await teamService.removeMember({
      team_id,
      user_id,
      owner_team_id,
    });
    res
      .status(200)
      .json({ message: "Xoá thành viên thành công", data: result });
  } catch (error) {
    console.error("Lỗi khi xoá thành viên:", error.message);
    if (error.message === "Bạn không có quyền xoá thành viên này") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Thành viên không tồn tại trong nhóm") {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};



module.exports = {
  createTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  getAllTeamsByOwner,
  getTeamMembers,
};
