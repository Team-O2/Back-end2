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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const _1 = require(".");
let User = class User extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.Default("https://o2-server.s3.ap-northeast-2.amazonaws.com/default_O2_Logo%403x.png"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "img", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "isMarketing", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "emailCode", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "isChallenge", void 0);
__decorate([
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], User.prototype, "isRegist", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "interest", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Like),
    __metadata("design:type", Array)
], User.prototype, "likes", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Scrap),
    __metadata("design:type", Array)
], User.prototype, "scraps", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Post),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Comment),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    sequelize_typescript_1.HasOne(() => _1.Badge),
    __metadata("design:type", _1.Badge)
], User.prototype, "badge", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Generation),
    __metadata("design:type", Array)
], User.prototype, "generations", void 0);
User = __decorate([
    sequelize_typescript_1.Table({
        tableName: "User",
        freezeTableName: true,
        underscored: false,
        timestamps: true,
        charset: "utf8",
        collate: "utf8_general_ci", // 한국어 설정
    })
], User);
exports.default = User;
//# sourceMappingURL=User.js.map