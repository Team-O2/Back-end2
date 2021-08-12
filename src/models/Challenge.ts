import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Unique,
  Default,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Post } from ".";

@Table({
  tableName: "Challenge",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class Challenge extends Model {
  @PrimaryKey
  @ForeignKey(() => Post)
  @Unique
  @Column
  id: number;

  @Default("")
  @Column
  good: string;

  @Default("")
  @Column
  learn: string;

  @Default("")
  @Column
  bad: string;

  @BelongsTo(() => Post)
  post: Post;
}