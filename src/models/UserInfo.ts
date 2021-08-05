import User from "./User";
import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import Generation from "./Generation";

@Table({
  tableName: "userInfo",
  freezeTableName: true,
  underscored: true,
  timestamps: false,
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

  @Default(
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg"
  )
  @Column
  img: string;

  @Default(false)
  @Column
  isChallenge: Boolean;

  @Default(false)
  @Column
  isRegist: Boolean;

  @HasMany(() => Generation)
  generations: Generation[];

  @PrimaryKey
  @AllowNull(false)
  @BelongsTo(() => User)
  user: User;
}
