"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      Bookmark.belongsTo(models.User, { foreignKey: "user_id" });
      Bookmark.belongsTo(models.Post, { foreignKey: "post_id" });
    }
  }

  Bookmark.init(
    {
      bookmark_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: DataTypes.UUID,
      post_id: DataTypes.UUID,
      bookmarked: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Bookmark",
      tableName: "Bookmarks",
      timestamps: false,
    }
  );

  return Bookmark;
};
