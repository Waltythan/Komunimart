import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({
  tableName: 'Bookmarks', timestamps: false
})

export class Bookmark extends Model<Bookmark> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare bookmark_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @ForeignKey(() => Post)
  @Column({ type: DataType.UUID, allowNull: false })
  declare post_id: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare bookmarked: boolean;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => Post, 'post_id')
  declare post: Post;
}
