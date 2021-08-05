import {
    Model,
    Column,
    Table,
    PrimaryKey,
    Unique,
    Default,
    AllowNull,
    ForeignKey,
    BelongsTo
  } from "sequelize-typescript";
  import User from './User'
  import Post from './Post'

  @Table({ tableName: "concert", freezeTableName: true, underscored: true})
  export default class Concert extends Model {
    @PrimaryKey
    @ForeignKey(() => Post)
    @Unique
    @Column
    id: number;
  
    @ForeignKey(() => User)
    @Column
    userID: number;

    @Default("")
    @Column
    title: string;

    @AllowNull
    @Column
    videoLink!: string;

    @AllowNull
    @Column
    imgThumbnail!: string;

    @AllowNull
    @Column
    text!: string;

    @Default(false)
    @Column
    isNotice: Boolean;

    @BelongsTo(() => Post)
    post: Post;
  }
  