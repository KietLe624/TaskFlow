module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_id: { type: DataTypes.INTEGER, allowNull: false },
      task_name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("to_do", "in_progress", "done"),
        defaultValue: "to_do",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },
      start_date: { type: DataTypes.DATE, allowNull: false },
      due_date: { type: DataTypes.DATE, allowNull: false },
      created_by: { type: DataTypes.INTEGER, allowNull: false },
      assignee_id: { type: DataTypes.INTEGER, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "tasks",
      timestamps: false,
    }
  );

  Task.associate = (models) => {
    Task.belongsTo(models.Project, { foreignKey: "project_id", as: "project" });
    Task.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
    Task.belongsTo(models.User, { foreignKey: "assignee_id", as: "assignee" });
  };

  return Task;
};
