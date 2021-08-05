import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Default,
  AllowNull,
  AutoIncrement,
  Unique,
  ForeignKey,
} from "sequelize-typescript";
import User from "./User";
import Post from "./Post";

@Table({
  tableName: "userInfo",
  freezeTableName: true,
  underscored: true,
  timestamps: false,
})
export default class Scrap extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @PrimaryKey
  @ForeignKey(() => Post)
  @Column
  postID: number;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column
  userID: number;

  // @BelongsTo(() => UserInfo)
  // userInfo: UserInfo;

  // @BelongsToMany(() => UserInterest)
  // userInterest: UserInterest[];
}
