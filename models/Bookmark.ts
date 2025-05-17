import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Bookmark extends Model {
    public bookmark_id!: string;
    public user_id!: string;
    public post_id!: string;
    public bookmarked!: boolean;

    public static associations: {
      user: Association<Bookmark, any>;
      post: Association<Bookmark, any>;
    };

    static associate(models: any) {
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
