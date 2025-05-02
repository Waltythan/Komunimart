"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.User, { foreignKey: "author_id" });
      Comment.belongsTo(models.Post, { foreignKey: "post_id" });
    }
  }

  Comment.init(
    {
      comment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      post_id: DataTypes.UUID,
      author_id: DataTypes.UUID,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "Comments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return Comment;
};
