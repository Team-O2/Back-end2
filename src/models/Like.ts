import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Post from "./Post";
import User from "./User";

@Table({ tableName: "Like", freezeTableName: true, underscored: false })
export default class Like extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @ForeignKey(() => Post)
  @Column
  postID: number;

  @ForeignKey(() => User)
  @Column
  userID: number;

  @BelongsTo(() => Post)
  post: Post;

  @BelongsTo(() => User)
  user: User;
}
