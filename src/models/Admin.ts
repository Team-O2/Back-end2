import {
  Model,
  Column,
  CreatedAt,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  HasMany,
} from "sequelize-typescript";
import { Sequelize } from "sequelize";
import { Generation } from ".";

@Table({
  tableName: "Admin",
  freezeTableName: true,
  underscored: false,
  timestamps: false,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
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

  @Column
  generation: number;

  @Default(0)
  @Column
  limitNum: number;

  @Default(0)
  @Column
  applyNum: number;

  @Default(
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png"
  )
  @Column
  img?: string;

  @CreatedAt
  @Default(Sequelize.fn("NOW"))
  @Column
  createdAt?: Date;

  @HasMany(() => Generation)
  generations: Generation[];
}
