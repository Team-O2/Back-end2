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
  ForeignKey,
  BelongsTo,
  HasOne,
  HasMany,
} from "sequelize-typescript";
import { Scrap, User, Concert, Challenge, Like, Comment } from ".";

@Table({
  tableName: "Post",
  freezeTableName: true,
  underscored: false,
  timestamps: true,
  charset: "utf8", // 한국어 설정
  collate: "utf8_general_ci", // 한국어 설정
})
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

  @Default(0)
  @Column
  generation: number;

  @Column
  interest: string;

  @BelongsTo(() => User)
  user: User;

  @HasOne(() => Concert)
  concert: Concert;

  @HasOne(() => Challenge)
  challenge: Challenge;

  @HasMany(() => Comment)
  comments: Comment[];

  @HasMany(() => Like)
  likes: Like[];

  @HasMany(() => Like)
  userLikes: Like[];

  @HasMany(() => Scrap)
  scraps: Scrap[];

  @HasMany(() => Scrap)
  userScraps: Scrap[];
}
