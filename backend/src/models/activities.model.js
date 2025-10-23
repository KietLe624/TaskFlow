// models/activity.model.js
module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    "Activity",
    {
      activity_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      entity_type: {
        type: DataTypes.ENUM(
          "task",
          "project",
          "team",
          "comment",
          "file",
          "other"
        ),
        allowNull: false,
      },
      entity_id: { type: DataTypes.INTEGER, allowNull: false },
      action: {
        type: DataTypes.ENUM(
          "created",
          "updated",
          "deleted",
          "assigned",
          "commented",
          "uploaded"
        ),
        allowNull: false,
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "activities",
      timestamps: false,
    }
  );

  Activity.associate = (models) => {
    Activity.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return Activity;
};
