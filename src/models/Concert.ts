import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Unique,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User, Post } from ".";

@Table({
  tableName: "Concert",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class Concert extends Model {
  @PrimaryKey
  @ForeignKey(() => Post)
  @Unique
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userID: number;

  @Default("")
  @Column
  title: string;

  @AllowNull
  @Column
  videoLink!: string;

  @AllowNull
  @Column
  imgThumbnail!: string;

  @AllowNull
  @Column
  text!: string;

  @Default(false)
  @Column
  isNotice: Boolean;

  @BelongsTo(() => Post)
  post: Post;
}
