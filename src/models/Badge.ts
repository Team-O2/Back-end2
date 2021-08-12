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
import { User } from ".";

@Table({
  tableName: "Badge",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class Badge extends Model {
  @PrimaryKey
  @ForeignKey(() => User)
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

  @BelongsTo(() => User)
  user: User;
}
