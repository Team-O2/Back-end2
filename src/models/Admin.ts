import {
  Model,
  Column,
  CreatedAt,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
} from "sequelize-typescript";
import { Sequelize } from "sequelize";

@Table({
  tableName: "admin",
  freezeTableName: true,
  underscored: true,
  timestamps: false,
})
export default class Admin extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  id: number;

  @Column
  title: string;

  @Column
  registerStartDT: Date;

  @Column
  registerEndDT: Date;

  @Column
  challengeStartDT: Date;

  @Column
  challengeEndDT: Date;

  @Default(0)
  @Column
  limitNum: number;

  @Default(0)
  @Column
  applyNum: number;

  @Default(
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg"
  )
  @Column
  img!: string;

  @CreatedAt
  @Default(Sequelize.fn("NOW"))
  @Column
  createdAt?: Date;
}