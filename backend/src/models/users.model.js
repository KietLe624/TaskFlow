module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(255), allowNull: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: true },
    phone_number: { type: DataTypes.STRING(20), allowNull: true },
    avatar_url: { type: DataTypes.STRING(255), allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: "users",
    timestamps: false,
  });

  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: "owner_id", as: "ownedProjects" });
    User.belongsToMany(models.Project, { through: "project_members", foreignKey: "user_id", as: "projects" });
    User.hasMany(models.Task, { foreignKey: "created_by", as: "createdTasks" });
    User.hasMany(models.Task, { foreignKey: "assignee_id", as: "assignedTasks" });
    User.hasMany(models.Team, { foreignKey: "owner_team_id", as: "ownedTeams" });
    User.belongsToMany(models.Team, { through: "team_members", foreignKey: "user_id", as: "teams" });
  };

  return User;
};
