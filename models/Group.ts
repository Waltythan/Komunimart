import { Model, DataTypes, Sequelize, Association } from "sequelize";

export default (sequelize: Sequelize) => {
  class Group extends Model {
    public group_id!: number;
    public name!: string;
    public description!: string;
    public created_by!: number;

    public static associations: {
      creator: Association<Group, any>;
      posts: Association<Group, any>;
      users: Association<Group, any>;
    };

    static associate(models: any) {
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
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
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
