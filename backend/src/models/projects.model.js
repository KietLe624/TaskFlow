module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    "Project",
    {
      project_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_name: { type: DataTypes.STRING(255), allowNull: false },
      owner_id: { type: DataTypes.INTEGER, allowNull: false },
      team_id: { type: DataTypes.INTEGER, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM(
          "to_do",
          "in_progress",
          "completed",
          "over_due",
          "on_hold"
        ),
        defaultValue: "to_do",
      },
      priority: {
        type: DataTypes.ENUM("high", "medium", "low"),
        defaultValue: "medium",
      },
      client: { type: DataTypes.STRING(255), allowNull: true },
      budget: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      start_date: { type: DataTypes.DATE, allowNull: false },
      due_date: { type: DataTypes.DATE, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "projects",
      timestamps: false,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.Team, { foreignKey: "team_id", as: "team" });
    Project.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
    Project.hasMany(models.Task, { foreignKey: "project_id", as: "tasks" });
    Project.belongsToMany(models.User, {
      through: "project_members",
      foreignKey: "project_id",
      as: "members",
    });
  };

  return Project;
};
