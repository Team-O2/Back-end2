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
import { Comment, Like, Scrap, Post, Badge, Generation } from ".";

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
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png"
  )
  @Column
  img: string;

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

  @Column
  interest: string;

  @HasMany(() => Like)
  likes: Like[];

  @HasMany(() => Scrap)
  scraps: Scrap[];

  @HasMany(() => Post)
  posts: Post[];

  @HasMany(() => Comment)
  comments: Comment[];

  @HasOne(() => Badge)
  badge: Badge;

  @HasMany(() => Generation)
  generations: Generation[];
}
