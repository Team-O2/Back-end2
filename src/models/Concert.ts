import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Unique,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./User";
import Post from "./Post";

@Table({
  tableName: "concert",
  freezeTableName: true,
  underscored: true,
  timestamps: true,
})
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

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Post)
  post: Post;
}
