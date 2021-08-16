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
import { User, Post } from ".";

@Table({
  tableName: "Comment",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
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

  @ForeignKey(() => Post)
  @Column
  postID: number;

  @Default(1)
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

  @BelongsTo(() => Post)
  post: Post;
}
