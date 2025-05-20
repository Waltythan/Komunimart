import {
  Table, Column, Model, DataType,
  HasMany, ForeignKey
} from 'sequelize-typescript';
import { Post } from './Post';
import { Comment } from './Comment';
import { Group } from './Group';

@Table({
  tableName: 'Users', timestamps: false
})

export class User extends Model<User> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare user_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare uname: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member'
  })
  declare role: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, allowNull: true })
  declare group_id?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare created_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare updated_at: Date;

  @HasMany(() => Post, 'author_id')
  declare posts: Post[];

  @HasMany(() => Comment, 'author_id')
  declare comments: Comment[];

  @Column({ type: DataType.STRING, allowNull: true })
  declare profile_pic: string | null;
}
