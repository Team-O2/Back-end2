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
import { Post } from ".";

@Table({
  tableName: "Hashtag",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
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

  @BelongsTo(() => Post)
  post: Post;
}
