import User from "./User";
import {
  Model,
  Column,
  CreatedAt,
  UpdatedAt,
  Table,
  DataType,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  AllowNull,
  ForeignKey,
} from "sequelize-typescript";

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

  // @BelongsTo(() => UserInfo)
  // userInfo: UserInfo;

  // @BelongsToMany(() => UserInterest)
  // userInterest: UserInterest[];
}
