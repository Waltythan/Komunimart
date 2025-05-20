import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Group } from './Group';
import { Comment } from './Comment';

@Table({
  tableName: 'Posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

export class Post extends Model<Post> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare post_id: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, allowNull: false })
  declare group_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare author_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare content: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare image_url: string | null;

  @BelongsTo(() => Group, 'group_id')
  declare group: Group;

  @BelongsTo(() => User, 'author_id')
  declare author: User;

  @HasMany(() => Comment, 'post_id')
  declare comments: Comment[];
}
