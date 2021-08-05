import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  AllowNull,
  ForeignKey,
} from "sequelize-typescript";

import UserInfo from "./UserInfo";

@Table({
  tableName: "generation",
  freezeTableName: true,
  underscored: true,
  timestamps: false,
})
export default class Generation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @AllowNull(true)
  @Column
  generation: number;

  @ForeignKey(() => UserInfo)
  @Column
  userID: number;

  // @BelongsTo(() => UserInfo)
  // userInfo: UserInfo;

  // @BelongsToMany(() => UserInterest)
  // userInterest: UserInterest[];
}
