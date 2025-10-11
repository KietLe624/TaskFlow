module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "Task",
    {
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_id: { type: DataTypes.INTEGER, allowNull: true },
      task_name: { type: DataTypes.STRING(255), allowNull: false },
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
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
    Task.belongsToMany(models.User, {
      through: "task_assignees",
      foreignKey: "task_id",
      otherKey: "user_id",
      as: "assignees",
    });
  };

  return Task;
};
