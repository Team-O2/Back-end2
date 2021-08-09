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
import User from "./User";
import Generation from "./Generation";
import Badge from "./Badge";

@Table({
  tableName: "userInfo",
  freezeTableName: true,
  underscored: false,
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

  @BelongsTo(() => User)
  user: User;

  @HasOne(() => Badge)
  badges: Badge[];

  @HasMany(() => Generation)
  generations: Generation[];
}
