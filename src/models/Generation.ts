import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import UserInfo from "./UserInfo";

@Table({
  tableName: "Generation",
  freezeTableName: true,
  underscored: false,
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

  @BelongsTo(() => UserInfo)
  userInfo: UserInfo;
}
