import {
  Model,
  Column,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  ForeignKey,
} from "sequelize-typescript";
import User from "./User";

@Table({ tableName: "userInterest", freezeTableName: true, underscored: true })
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
}
