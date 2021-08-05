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
    ForeignKey
  } from "sequelize-typescript";
  import Post from'./Post'

  @Table({ tableName: "challenge", freezeTableName: true, underscored: true})
  export default class Challenge extends Model {
    @PrimaryKey
    @ForeignKey(() => Post)
    @Unique
    @Column
    id: number;
  
    @Default("")
    @Column
    good: string;

    @Default("")
    @Column
    learn: string;

    @Default("")
    @Column
    bad: string;

    @Default(0)
    @Column
    generation: number;
    
  }
  