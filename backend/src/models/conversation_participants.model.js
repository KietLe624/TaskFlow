module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define(
    "ConversationParticipant",
    {
      conve_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "conversations",
          key: "conve_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role: {
        type: DataTypes.ENUM("owner", "member"),
        defaultValue: "member",
      },
      last_read_mess: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "conversation_participants",
      timestamps: false,
    }
  );
  ConversationParticipant.associate = (models) => {
    ConversationParticipant.belongsTo(models.Conversation, {
      foreignKey: "conve_id",
      as: "conversation",
      onDelete: "CASCADE",
    });
    ConversationParticipant.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return ConversationParticipant;
};
