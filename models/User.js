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
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
      },
      uname: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("admin", "member"),
        defaultValue: "member",
      },
      groupId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Groups",
          key: "group_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return User;
};
