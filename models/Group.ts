import {
  Table, Column, Model, DataType,
  HasMany, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';

@Table({ tableName: 'Groups', timestamps: false })
export class Group extends Model<Group> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare group_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description?: string;

  // <<< tambahkan FK created_by
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare created_by: string;

  @BelongsTo(() => User, 'created_by')
  declare creator: User;

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

  @HasMany(() => User, 'group_id')
  declare users: User[];

  @HasMany(() => Post, 'group_id')
  declare posts: Post[];

  // Tambahkan kolom image_url
  @Column({ type: DataType.STRING, allowNull: true })
  declare image_url: string | null;
}
