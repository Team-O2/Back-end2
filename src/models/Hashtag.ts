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

@Table({ tableName: "hashtag", freezeTableName: true, underscored: true })
export default class Hashtag extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @ForeignKey(() => Post)
  @Column
  postID: number;

  @Column
  hashtag: string;

  @BelongsTo(()=>Post)
  post: Post;
}
