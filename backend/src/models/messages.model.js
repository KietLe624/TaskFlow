module.exports = (sequelize, DataTypes) => {
  const Messages = sequelize.define(
    "Messages",
    {
      mess_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conve_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT("medium"),
        allowNull: false,
      },
      reply_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      edited_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "messages",
      timestamps: false,
    }
  );
  Messages.associate = (models) => {
    Messages.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });
    Messages.belongsTo(models.Conversation, {
      foreignKey: "conve_id",
      as: "conversation",
    });
    Messages.hasMany(models.Attachment, {
      foreignKey: "message_id",
      as: "attachments",
    });
  };

  return Messages;
};
