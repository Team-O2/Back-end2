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
import User from "./User";
import Post from "./Post";

@Table({
  tableName: "scrap",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
})
export default class Scrap extends Model {
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

  @BelongsTo(() => User)
  user: User;
}
