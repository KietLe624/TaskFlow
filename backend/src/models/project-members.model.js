module.exports = (sequelize, DataTypes) => {
  const ProjectMember = sequelize.define(
    "ProjectMember", // <-- Tên model phải là "ProjectMember"
    {
      project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM("member", "admin"),
        defaultValue: "member",
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "project_members",
      timestamps: false,
    }
  );

  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "projects",
    });

    ProjectMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "users",
    });
  };

  return ProjectMember;
};
