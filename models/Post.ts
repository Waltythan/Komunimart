import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Post extends Model {
    public post_id!: number;
    public author_id!: number;
    public group_id!: number;
    public title!: string;
    public content!: string;
    public like_count!: number;

    public static associations: {
      user: Association<Post, any>;
      group: Association<Post, any>;
      comments: Association<Post, any>;
      likes: Association<Post, any>;
      bookmarks: Association<Post, any>;
    };

    static associate(models: any) {
      Post.belongsTo(models.User, { foreignKey: "author_id" });
      Post.belongsTo(models.Group, { foreignKey: "group_id" });
      Post.hasMany(models.Comment, { foreignKey: "post_id" });
      Post.hasMany(models.Like, { foreignKey: "post_id" });
      Post.hasMany(models.Bookmark, { foreignKey: "post_id" });
    }
  }

  Post.init(
    {
      post_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      author_id: DataTypes.INTEGER,
      group_id: DataTypes.INTEGER,
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      like_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "Posts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Post;
};
