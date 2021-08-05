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

@Table({
  tableName: "postInterest",
  freezeTableName: true,
  underscored: true,
})
export default class PostInterest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @ForeignKey(() => Post)
  @Column
  postID: number;

  @Column
  interest: string;

  @BelongsTo(() => Post)
  post: Post;
}
