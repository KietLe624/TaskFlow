module.exports = (sequelize, DataTypes) => {
  const TaskAssignees = sequelize.define(
    "TaskAssignees",
    {
      task_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      assigned_by: {
        // người giao nhiệm vụ
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "task_assignees",
      timestamps: false,
    }
  );

  TaskAssignees.associate = (models) => {
    TaskAssignees.belongsTo(models.Task, {
      foreignKey: "task_id",
      as: "task",
      timestamps: false,
    });
    TaskAssignees.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "assignee",
      timestamps: false,
    });
    TaskAssignees.belongsTo(models.User, {
      foreignKey: "assigned_by",
      as: "assigner",
      timestamps: false,
    });
  };

  return TaskAssignees;
};
