import {
  Model,
  Column,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  AllowNull,
  HasMany,
  HasOne,
} from "sequelize-typescript";
import Comment from "./Comment";
import Like from "./Like";
import Post from "./Post";
import Scrap from "./Scrap";
import UserInfo from "./UserInfo";
import UserInterest from "./UserInterest";

@Table({
  tableName: "user",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @Column
  email: string;

  @Column
  nickname: string;

  @Default(false)
  @Column
  isMarketing: Boolean;

  @Default(2)
  @Column
  gender: number;

  @AllowNull
  @Column
  emailCode!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasOne(() => UserInfo)
  userInfos: UserInfo;

  @HasMany(() => Like)
  likes: Like[];

  @HasMany(() => Scrap)
  scraps: Scrap[];

  @HasMany(() => Post)
  posts: Post[];

  @HasMany(() => UserInterest)
  userInterests: UserInterest[];

  @HasMany(() => Comment)
  comments: Comment[];
}
