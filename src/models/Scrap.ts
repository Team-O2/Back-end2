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
import { User, Post } from ".";

@Table({
  tableName: "Scrap",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
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