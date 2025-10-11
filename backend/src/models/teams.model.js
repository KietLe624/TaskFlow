module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "Team",
    {
      team_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      team_name: { type: DataTypes.STRING(255), allowNull: false },
      owner_team_id: { type: DataTypes.INTEGER, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "teams",
      timestamps: false,
    }
  );

  Team.associate = (models) => {
    // 1 team có 1 owner (User)
    Team.belongsTo(models.User, {
      foreignKey: "owner_team_id",
      as: "owner",
    });

    //N-N: 1 team có nhiều user (qua TeamMember)
    Team.belongsToMany(models.User, {
      through: models.TeamMember,
      foreignKey: "team_id",
      otherKey: "user_id",
      as: "members",
    });

    //1-N: 1 team có nhiều bản ghi team_member
    Team.hasMany(models.TeamMember, {
      foreignKey: "team_id",
      as: "teamMemberships",
    });
  };

  return Team;
};
