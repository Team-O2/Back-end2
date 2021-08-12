import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  ForeignKey,
  HasOne,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import { User, Generation, Badge } from ".";

@Table({
  tableName: "UserInfo",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class UserInfo extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  id: number;

  @Default(0)
  @Column
  challengeNum: number;

  @Default(0)
  @Column
  conditionNum: number;

  @Default(0)
  @Column
  writingNum: number;

  @Default(false)
  @Column
  isAdmin: Boolean;

  @Default(false)
  @Column
  isChallenge: Boolean;

  @Default(false)
  @Column
  isRegist: Boolean;

  @BelongsTo(() => User)
  user: User;

  @HasOne(() => Badge)
  badges: Badge[];

  @HasMany(() => Generation)
  generations: Generation[];
}
