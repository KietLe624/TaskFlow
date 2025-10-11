module.exports = (sequelize, DataTypes) => {
  const TeamMember = sequelize.define(
    "TeamMember",
    {
      team_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM("member", "admin", "owner"),
        defaultValue: "member",
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "team_members",
      timestamps: false,
    }
  );

  TeamMember.associate = (models) => {
    TeamMember.belongsTo(models.Team, {
      foreignKey: "team_id",
      as: "team",
    });

    TeamMember.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return TeamMember;
};
