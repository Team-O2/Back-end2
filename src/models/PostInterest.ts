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
  tableName: "concertInterest",
  freezeTableName: true,
  underscored: true,
})
export default class concertInterest extends Model {
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
