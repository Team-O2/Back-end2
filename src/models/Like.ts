import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
} from "sequelize-typescript";
import Post from "./Post";
import User from "./User";

@Table({ tableName: "like", freezeTableName: true, underscored: true })
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
}
