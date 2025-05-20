import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Comment extends Model {
    public comment_id!: number;
    public author_id!: number;
    public post_id!: number;
    public text!: string;
    public parent_id?: number | null;

    public static associations: {
      user: Association<Comment, any>;
      post: Association<Comment, any>;
      parent: Association<Comment, any>;
    };

    static associate(models: any) {
      Comment.belongsTo(models.User, { foreignKey: "author_id" });
      Comment.belongsTo(models.Post, { foreignKey: "post_id" });
      Comment.belongsTo(models.Comment, { foreignKey: "parent_id", as: "parent" });
      Comment.hasMany(models.Comment, { foreignKey: "parent_id", as: "replies" });
    }
  }

  Comment.init(
    {
      comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: DataTypes.INTEGER,
      post_id: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "Comments",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Comment;
};
