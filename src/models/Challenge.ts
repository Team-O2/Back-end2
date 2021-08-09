import {
  Model,
  Column,
  Table,
  PrimaryKey,
  Unique,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import Post from "./Post";

@Table({
  tableName: "Challenge",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
})
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

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Post)
  post: Post;
}
