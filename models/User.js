"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Post, { foreignKey: "author_id" });
      User.hasMany(models.Comment, { foreignKey: "author_id" });
      User.hasMany(models.Like, { foreignKey: "user_id" });
      User.hasMany(models.Bookmark, { foreignKey: "user_id" });
      User.belongsToMany(models.Group, {
        through: "GroupMembers",
        foreignKey: "user_id",
        otherKey: "group_id",
      });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      uname: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("admin", "member"),
        defaultValue: "member",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return User;
};
