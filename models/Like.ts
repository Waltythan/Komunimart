import {
  Table, Column, Model, DataType, ForeignKey
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'Likes', timestamps: false
})
export class Like extends Model<Like> {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare like_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare likeable_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare likeable_type: string; // 'Post' or 'Comment'
}
