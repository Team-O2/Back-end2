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

@Table({ tableName: "user", freezeTableName: true, underscored: true })
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
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

  //   @BelongsTo(() => UserInfo)
  //   userInfo: UserInfo;

  //   @BelongsToMany(() => UserInterest)
  //   userInterest: UserInterest[];
}
