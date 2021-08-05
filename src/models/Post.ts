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
    ForeignKey
  } from "sequelize-typescript";
  import User from'./User'

  @Table({ tableName: "post", freezeTableName: true, underscored: true, timestamps: true })
  export default class Post extends Model {
    @PrimaryKey
    @AutoIncrement
    @Unique
    @Column
    id: number;
  
    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    @ForeignKey(() => User)
    @Column
    userID: number;

    @Default(false)
    @Column
    isDeleted: Boolean;
  }
  