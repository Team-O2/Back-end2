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
import Badge from "./Badge";
import Generation from "./Generation";
import UserInterest from "./UserInterest";

@Table({
  tableName: "User",
  freezeTableName: true,
  underscored: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @Column
  email: string;

  @Unique
  @Column
  password: string;

  @Column
  nickname: string;

  @Default(false)
  @Column
  isMarketing: Boolean;

  @AllowNull
  @Column
  emailCode!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @Default(false)
  @Column
  isAdmin: Boolean;

  @Default(false)
  @Column
  isChallenge: Boolean;

  @Default(false)
  @Column
  isRegist: Boolean;

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

  @HasOne(() => Badge)
  badges: Badge[];

  @HasMany(() => Generation)
  generations: Generation[];
}
