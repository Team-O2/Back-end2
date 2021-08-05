import {
  Model,
  Column,
  CreatedAt,
  UpdatedAt,
  Table,
  DataType,
  BelongsToMany,
  PrimaryKey,
  AutoIncrement,
  Unique,
  Default,
  AllowNull,
} from "sequelize-typescript";

@Table({ tableName: "admin", freezeTableName: true, underscored: true })
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
  limitNum: number;

  @Column
  applyNum: number;

  @Default(
    "https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg"
  )
  @Column
  img!: string;

  @CreatedAt
  @Column
  createdAt!: Date;
}
