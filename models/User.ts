import { Model, DataTypes, Sequelize, Association } from 'sequelize';

export default (sequelize: Sequelize) => {
  class User extends Model {
    public user_id!: number;
    public uname!: string;
    public email!: string;
    public password!: string;
    public role!: 'admin' | 'member';
    public groupId?: number;

    public static associations: {
      posts: Association<User, any>;
      comments: Association<User, any>;
      likes: Association<User, any>;
      bookmarks: Association<User, any>;
      groups: Association<User, any>;
    };

    static associate(models: any) {
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
