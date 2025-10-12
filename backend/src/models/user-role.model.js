module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define("UserRole", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: "user_role",
    timestamps: false,
  });

  return UserRole;
};
