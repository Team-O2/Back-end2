import {
  Model,
  Column,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import User from "./User";

@Table({
  tableName: "Comment",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
})
export default class Comment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userID: number;

  @Default(false)
  @Column
  isDeleted: Boolean;

  @Column
  text: string;

  @Column
  postID: number;

  @Column
  groupNum: number;

  @Default(0)
  @Column
  level: number;

  @Column
  order: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => User)
  user: User;
}
