module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    "Attachment",
    {
      attach_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      
      task_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      message_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      file_name: {
        type: DataTypes.TEXT("medium"),
        allowNull: true,
      },

      file_url: {
        type: DataTypes.TEXT("medium"),
        allowNull: true,
      },

      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "attachments",
      timestamps: false,
    }
  );

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Messages, {
      foreignKey: "message_id",
      as: "message",
    });
  };

  return Attachment;
};
