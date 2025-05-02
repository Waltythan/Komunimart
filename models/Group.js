"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.User, { foreignKey: "created_by" });
      Group.hasMany(models.Post, { foreignKey: "group_id" });
      Group.belongsToMany(models.User, {
        through: "GroupMembers",
        foreignKey: "group_id",
        otherKey: "user_id",
      });
    }
  }

  Group.init(
    {
      group_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      created_by: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Group",
      tableName: "Groups",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Group;
};
