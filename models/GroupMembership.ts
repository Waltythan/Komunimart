import {
  Table, Column, Model, DataType,
  ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Group } from './Group';

@Table({
  tableName: 'GroupMemberships',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'group_id']
    }
  ]
})
export class GroupMembership extends Model<GroupMembership> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare user_id: string;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare group_id: string;

  @BelongsTo(() => Group, 'group_id')
  declare group: Group;

  @Column({
    type: DataType.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member'
  })
  declare role: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare joined_at: Date;
}
