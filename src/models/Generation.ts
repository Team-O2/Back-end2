import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { User } from ".";
@Table({
  tableName: "Generation",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class Generation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @AllowNull(true)
  @Column
  generation: number;

  @Default(0)
  @Column
  challengeNum: number;

  @Default(0)
  @Column
  conditionNum: number;

  @Default(0)
  @Column
  writingNum: number;


  @ForeignKey(() => User)
  @Column
  userID: number;

  @BelongsTo(() => User)
  user: User;
}
