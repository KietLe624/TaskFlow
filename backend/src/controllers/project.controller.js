const projectService = require("../services/project.service");

// Create project
const createProject = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Lấy userId từ token
    const projectData = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    if (
      !projectData ||
      !projectData.project_name ||
      !projectData.owner_id ||
      !projectData.status ||
      !projectData.start_date ||
      !projectData.due_date
    ) {
      return res.status(400).json({ error: "Thiếu thông tin dự án" });
    }

    const newProject = await projectService.createProject({
      ...projectData,
      owner_id: userId,
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    //kiểm tra thông tin
    const userId = req.user?.user_id; // Lấy userId từ token
    const projectData = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    const projectId = req.params.project_id;
    if (!projectId) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }

    //gọi service
    const updatedProject = await projectService.updateProject(
      projectId,
      projectData
    );
    if (!updatedProject) {
      return res.status(404).json({ error: "Dự án không tồn tại" });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật dự án thành công", updatedProject });
  } catch (error) {
    console.error("Lỗi cập nhật dự án:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Lấy userId từ token
    if (!userId) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }
    const projectId = req.params.project_id;
    if (!projectId) {
      return res.status(400).json({ error: "Thiếu project_id" });
    }
    const deletedProject = await projectService.deleteProject(projectId);
    if (!deletedProject) {
      return res.status(404).json({ error: "Dự án không tồn tại" });
    }
    return res
      .status(200)
      .json({ message: "Xóa dự án thành công", deletedProject });
  } catch (error) {
    console.error("Lỗi xóa dự án:", error);
    return res.status(500).json({ error: "Lỗi server" });
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
    console.error("Lỗi lấy danh sách dự án:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  //   getProjectsByUserId,
  //   getProjectById,
};
