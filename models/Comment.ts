import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Comment extends Model {
    public comment_id!: string;
    public post_id!: string;
    public author_id!: string;
    public content!: string;

    public static associations: {
      user: Association<Comment, any>;
      post: Association<Comment, any>;
    };

    static associate(models: any) {
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
