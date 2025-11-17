module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      conve_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      type: {
        type: DataTypes.ENUM("group", "team", "project"),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      team_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      project_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      tableName: "conversations",
      timestamps: false,
    }
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });
    // MỘT conversation có NHIỀU tin nhắn
    Conversation.hasMany(models.Messages, {
      foreignKey: "conve_id",
      as: "messages",
    });

    // MỘT conversation có NHIỀU người tham gia
    Conversation.hasMany(models.ConversationParticipant, {
      foreignKey: "conve_id",
      as: "participants",
    });

    // MỘT conversation có NHIỀU người dùng (User) thông qua bảng Participant
    Conversation.belongsToMany(models.User, {
      through: models.ConversationParticipant,
      foreignKey: "conve_id",
      otherKey: "user_id",
      as: "members",
    });

    Conversation.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return Conversation;
};
