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
import { Comment, UserInfo, Like, Scrap, Post, UserInterest, Badge } from ".";

@Table({
  tableName: "User",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
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

  @Default(
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg"
  )
  @Column
  img: string;

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

  @HasOne(() => Badge)
  badge: Badge;
}
