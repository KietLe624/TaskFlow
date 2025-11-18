module.exports = (sequelize, DataTypes) => {
  const TaskComment = sequelize.define(
    "TaskComment",
    {
      cmt_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: "task_comments",
      timestamps: false,
    }
  );

  TaskComment.associate = (models) => {
    TaskComment.belongsTo(models.Task, { foreignKey: "task_id", as: "task" });
    TaskComment.belongsTo(models.User, { foreignKey: "user_id", as: "author" });
  };

  return TaskComment;
};
