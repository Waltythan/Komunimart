import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'Likes', timestamps: false
})

export class Like extends Model<Like> {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  declare post_id: string;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => Post, 'post_id')
  declare post: Post;
}
