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

// create team admin
const createTeamAdmin = async (req, res) => {
  try {
    const { team_name, owner_team_id } = req.body;

    // KIỂM TRA CẢ 2 TRƯỜNG – BẮT BUỘC!
    if (!team_name || team_name.trim() === "") {
      return res.status(400).json({ message: "Tên nhóm không được để trống" });
    }
    if (!owner_team_id || isNaN(owner_team_id)) {
      return res.status(400).json({ message: "Vui lòng chọn owner cho team" });
    }

    const newTeam = await teamService.createTeamAdmin({ 
      team_name: team_name.trim(), 
      owner_team_id: Number(owner_team_id) 
    });

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
//get all teams admin
const getAllTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// [GET] /api/teams/:id/overview
const getTeamOverview = async (req, res) => {
  try {
    const { team_id } = req.params;
    const user_id = req.user.user_id;

    const data = await teamService.getTeamOverview(team_id, user_id);

    res.json({
      message: "Lấy thông tin team thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi controller getTeamOverview:", error.message);
    res.status(400).json({
      message: error.message || "Lỗi server khi lấy thông tin team",
    });
  }
};

// [GET] /api/teams/:id/projects
const getTeamProjects = async (req, res) => {
  try {
    const { team_id } = req.params;
    const userId = req.user.user_id;

    const projects = await teamService.getTeamProjects(team_id, userId);

    res.json({
      message: "Lấy danh sách dự án thành công",
      data: projects,
    });
  } catch (err) {
    if (err.message === "Team không tồn tại") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Bạn không có quyền truy cập team này") {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
};

// invite member to team
const inviteMember = async (req, res) => {
  try {
    const { team_id, email } = req.body;
    const owner_team_id = req.user?.user_id; // Lấy từ token

    const result = await teamService.inviteMember({
      team_id,
      email,
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

// change member role in team
const changeMemberRole = async (req, res) => {
  try {
    const { team_id, user_id, new_role } = req.body;
    const owner_team_id = req.user?.user_id; // Lấy từ token
    const result = await teamService.changeMemberRole({
      team_id,
      user_id,
      new_role,
      owner_team_id,
    });
    res.status(200).json({
      message: "Thay đổi vai trò thành viên thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò thành viên:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  createTeamAdmin,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  getAllTeams,
  getAllTeamsByOwner,
  getTeamMembers,
  getTeamOverview,
  getTeamProjects,
  changeMemberRole,
};
