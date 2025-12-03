const projectService = require("../services/project.service");
const projectMemberService = require("../services/project-member.service");

// Create project
const createProject = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Lấy userId từ token
    const projectData = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    const { start_date, due_date } = projectData;
    if (start_date && due_date) {
      const start = new Date(start_date);
      const end = new Date(due_date);
      if (end < start) {
        return res.status(400).json({
          message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!",
        });
      }
    }

    if (
      !projectData ||
      !projectData.project_name ||
      !projectData.status ||
      !projectData.start_date ||
      !projectData.due_date
    ) {
      return res.status(400).json({ error: "Thiếu thông tin dự án" });
    }

    const newProject = await projectService.createProject(
      projectData,
      req.user
    );

    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const projectId = req.params.project_id;
    const projectData = req.body;

    const updatedProject = await projectService.updateProject(
      projectId,
      userId,
      projectData
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    res.status(200).json({
      message: "Cập nhật dự án thành công",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Lỗi cập nhật dự án:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const user_id = req.user?.user_id; // Lấy userId từ token
    if (!user_id) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    const project_id = req.params.project_id;
    if (!project_id) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }

    //Truyền userId vào service
    const deletedProject = await projectService.deleteProject(
      project_id,
      user_id
    );

    if (!deletedProject) {
      return res.status(404).json({ error: "Dự án không tồn tại" });
    }

    return res.status(200).json({
      message: "Xóa dự án thành công",
      deletedProject,
    });
  } catch (error) {
    console.error("Lỗi xóa dự án:", error.message);

    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ error: error.message });
    }

    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: "Lỗi server", detail: error.message });
  }
};

// delete project by admin
const adminDeleteProject = async (req, res) => {
  try {
    const { project_id } = req.params;

    if (!project_id) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }

    const result = await projectService.deleteProjectByAdmin(project_id);

    return res.status(200).json({
      message: result.message,
      data: result.deletedProject,
    });
  } catch (error) {
    console.error("Admin delete project error:", error.message);

    if (error.message.includes("không tồn tại")) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({
      error: "Lỗi server khi xóa dự án. Vui lòng thử lại sau.",
    });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Lấy userId từ token
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }
    const projects = await projectService.getAllProjects();
    return res
      .status(200)
      .json({ message: "Lấy danh sách dự án thành công", projects });
  } catch (error) {
    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message.includes("không có quyền")) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// Get projects by user ID
const getProjectsByUserId = async (req, res) => {
  try {
    const userId = req.params?.user_id;
    if (!userId) {
      return res.status(400).json({ error: "Thiếu user_id" });
    }
    const projects = await projectService.getProjectsByUserId(userId);
    return res
      .status(200)
      .json({ message: "Lấy danh sách dự án thành công", projects });
  } catch (error) {
    console.error("Lỗi lấy dự án theo user ID:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const getStatus = async (req, res) => {
  try {
    const status = await projectService.getStatus();
    return res
      .status(200)
      .json({ message: "Lấy danh sách trạng thái thành công", status });
  } catch (error) {
    console.error("Lỗi lấy trạng thái dự án:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const getPriorities = async (req, res) => {
  try {
    const priorities = await projectService.getPriorities();
    return res
      .status(200)
      .json({ message: "Lấy danh sách mức độ ưu tiên thành công", priorities });
  } catch (error) {
    console.error("Lỗi lấy mức độ ưu tiên:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    let projectId = req.params.project_id;
    if (!projectId) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }

    const project = await projectService.getProjectById(projectId, userId);

    // Nếu service trả null thay vì ném lỗi khi không tìm thấy
    if (!project) {
      return res.status(404).json({ error: "Không tìm thấy dự án." });
    }

    return res.status(200).json({
      message: "Lấy thông tin dự án thành công",
      project,
    });
  } catch (error) {
    // Logging có thêm context
    console.error(
      `Lỗi lấy thông tin dự án - userId=${req.user?.user_id} projectId=${req.params.project_id}:`,
      error
    );

    // Nếu service ném custom error với status (nên làm ở service)
    if (error && error.status) {
      return res.status(error.status).json({ error: error.message });
    }

    // Fallback: dò chuỗi thông báo lỗi (case-insensitive)
    const msg = error && error.message ? error.message.toLowerCase() : "";

    if (
      msg.includes("không có quyền") ||
      msg.includes("không có quyền truy cập") ||
      msg.includes("permission")
    ) {
      return res.status(403).json({ error: error.message });
    }

    if (
      msg.includes("không tìm thấy") ||
      msg.includes("not found") ||
      msg.includes("not exist")
    ) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: "Lỗi server" });
  }
};

const getProjectMembers = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }
    const projectId = req.params.project_id;
    if (!projectId) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }
    const members = await projectService.getProjectMembers(projectId, userId);
    return res.status(200).json({
      message: "Lấy danh sách thành viên dự án thành công",
      members,
    });
  } catch (error) {
    console.error("Lỗi lấy thành viên dự án:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// const inviteMemberToProject = async (req, res) => {
//   try {
//     const userId = req.user?.user_id;
//     if (!userId) {
//       return res.status(401).json({ error: "Chưa đăng nhập" });
//     }

//     const projectId = req.params.project_id;
//     const { memberEmail } = req.body;
//     if (!projectId || !memberEmail) {
//       return res
//         .status(400)
//         .json({ error: "Thiếu project_id hoặc memberEmail" });
//     }
//     const result = await projectService.inviteMemberToProject(
//       projectId,
//       userId,
//       memberEmail
//     );
//     return res.status(200).json({
//       message: "Mời thành viên vào dự án thành công",
//       result,
//     });
//   } catch (error) {
//     console.error("Lỗi mời thành viên vào dự án:", error);
//     return res.status(500).json({ error: "Lỗi server" });
//   }
// };
const inviteMemberToProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { memberEmail } = req.body;
    const requestingUserId = req.user.user_id;
    const result = await projectService.inviteMemberToProject(
      project_id,
      requestingUserId,
      memberEmail
    );

    return res.status(200).json({
      message: "Mời thành viên thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi mời thành viên:", error);
    return res.status(400).json({ message: error.message });
  }
};

const changeMemberRole = async (req, res) => {
  try {
    let { project_id, user_id } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.user_id;

    project_id = parseInt(project_id, 10);
    user_id = parseInt(user_id, 10);

    const result = await projectMemberService.changeRole(
      project_id,
      user_id,
      role,
      currentUserId
    );

    // global.sendNotification(user_id, {
    //   title: "Vai trò đã thay đổi",
    //   message: `Bạn giờ là ${role.toUpperCase()} của dự án`,
    //   type: "system",
    //   link: `/projects/${project_id}`,
    // });

    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const removeMemberFromProject = async (req, res) => {
  try {
    let { project_id, user_id } = req.params;
    const currentUserId = req.user.user_id;
    project_id = parseInt(project_id, 10);
    user_id = parseInt(user_id, 10);
    const result = await projectMemberService.removeMember(
      project_id,
      user_id,
      currentUserId
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// lấy danh sách dự án gần
const getRecentProjects = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ middleware verifyToken
    const projects = await projectService.getRecentProjects(userId);

    return res.status(200).json({
      recentProjects: projects,
    });
  } catch (error) {
    console.error("Sidebar init error:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  adminDeleteProject,
  getStatus,
  getPriorities,
  getAllProjects,
  getProjectsByUserId,
  getProjectById,
  getProjectMembers,
  inviteMemberToProject,
  changeMemberRole,
  removeMemberFromProject,
  getRecentProjects,
};
