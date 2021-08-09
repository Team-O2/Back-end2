import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import UserInfo from "./UserInfo";

@Table({ tableName: "badge", freezeTableName: true, underscored: false })
export default class Badge extends Model {
  @PrimaryKey
  @ForeignKey(() => UserInfo)
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @Default(false)
  @Column
  welcomeBadge: Boolean;

  @Default(false)
  @Column
  firstJoinBadge: Boolean;

  @Default(false)
  @Column
  firstWriteBadge: Boolean;

  @Default(false)
  @Column
  oneCommentBadge: Boolean;

  @Default(false)
  @Column
  fiveCommentBadge: Boolean;

  @Default(false)
  @Column
  oneLikeBadge: Boolean;

  @Default(false)
  @Column
  fiveLikeBadge: Boolean;

  @Default(false)
  @Column
  loginBadge: Boolean;

  @Default(false)
  @Column
  marketingBadge: Boolean;

  @Default(false)
  @Column
  firstReplyBadge: Boolean;

  @Default(false)
  @Column
  learnMySelfScrapBadge: Boolean;

  @Default(false)
  @Column
  challengeScrapBadge: Boolean;

  @Default(false)
  @Column
  concertScrapBadge: Boolean;

  @Default(0)
  @Column
  challengeBadge: number;

  @BelongsTo(() => UserInfo)
  userInfo: UserInfo;
}
