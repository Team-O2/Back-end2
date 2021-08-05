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
import UserInfo from "./UserInfo";
import Post from "./Post";
import Badge from "./Badge";
import Like from "./Like";
import UserInterest from "./UserInterest";

@Table({
  tableName: "user",
  freezeTableName: true,
  underscored: true,
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

  @HasMany(() => Post)
  posts: Post[];

  @HasMany(() => UserInterest)
  userInterest: UserInterest[];

  @HasOne(() => Badge)
  badge: Badge[];

  @HasMany(() => Like)
  like: Like[];

  @HasOne(() => UserInfo)
  userInfos: UserInfo;
}
