import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import User from "./User";

@Table({ tableName: "UserInterest", freezeTableName: true, underscored: false })
export default class UserInterest extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userID: number;

  @Column
  interest: string;

  @BelongsTo(() => User)
  user: User;
}
