"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Comment_1;
Object.defineProperty(exports, "__esModule", { value: true });
// Comment model
const sequelize_typescript_1 = require("sequelize-typescript");
const _1 = require(".");
let Comment = Comment_1 = class Comment extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Comment.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => _1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Comment.prototype, "userID", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], Comment.prototype, "isDeleted", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Comment.prototype, "text", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    sequelize_typescript_1.ForeignKey(() => Comment_1),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Comment.prototype, "parentID", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => _1.Post),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Comment.prototype, "postID", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Comment.prototype, "level", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Comment.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => _1.User),
    __metadata("design:type", _1.User)
], Comment.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => _1.Post),
    __metadata("design:type", _1.Post)
], Comment.prototype, "post", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Comment_1),
    __metadata("design:type", Comment)
], Comment.prototype, "comment", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Comment_1),
    __metadata("design:type", Array)
], Comment.prototype, "children", void 0);
Comment = Comment_1 = __decorate([
    sequelize_typescript_1.Table({
        tableName: "Comment",
        freezeTableName: true,
        underscored: false,
        timestamps: true,
        charset: "utf8",
        collate: "utf8_general_ci", // 한국어 설정
    })
], Comment);
exports.default = Comment;
//# sourceMappingURL=Comment.js.map