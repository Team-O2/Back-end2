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
import Like from "./Like";
import Scrap from "./Scrap";
import UserInfo from "./UserInfo";

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

  @HasOne(() => UserInfo)
  userInfos: UserInfo;

  @HasMany(() => Like)
  likes: Like[];

  @HasMany(() => Scrap)
  scraps: Scrap[];
}
