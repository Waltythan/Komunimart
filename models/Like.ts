import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Like extends Model {
    public like_id!: string;
    public user_id!: string;
    public post_id!: string;
    public liked!: boolean;
    public unliked!: boolean;

    public static associations: {
      user: Association<Like, any>;
      post: Association<Like, any>;
    };

    static associate(models: any) {
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
