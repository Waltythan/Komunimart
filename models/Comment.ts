import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'Comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

export class Comment extends Model<Comment> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare comment_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare author_id: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  declare post_id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare text: string;

  @ForeignKey(() => Comment)
  @Column({ type: DataType.UUID, allowNull: true })
  declare parent_id?: string | null;

  @BelongsTo(() => User, 'author_id')
  declare author: User;

  @BelongsTo(() => Post, 'post_id')
  declare post: Post;

  @BelongsTo(() => Comment, 'parent_id')
  declare parent?: Comment;

  @HasMany(() => Comment, 'parent_id')
  declare replies: Comment[];
}
