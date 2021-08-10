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
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
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
