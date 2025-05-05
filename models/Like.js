"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "user_id" });
      Like.belongsTo(models.Post, { foreignKey: "post_id" });
    }
  }

  Like.init(
    {
      like_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: DataTypes.UUID,
      post_id: DataTypes.UUID,
      liked: DataTypes.BOOLEAN,
      unliked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "Likes",
      timestamps: false,
    }
  );

  return Like;
};
