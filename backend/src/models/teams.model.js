module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define("Team", {
    team_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    team_name: { type: DataTypes.STRING(255), allowNull: false },
    owner_team_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: "teams",
    timestamps: false,
  });

  Team.associate = (models) => {
    Team.belongsTo(models.User, { foreignKey: "owner_team_id", as: "owner" });
    Team.belongsToMany(models.User, { through: "team_members", foreignKey: "team_id", as: "members" });
    Team.hasMany(models.Project, { foreignKey: "team_id", as: "projects" });
  };

  return Team;
};
