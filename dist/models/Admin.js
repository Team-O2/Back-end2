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
const sequelize_1 = require("sequelize");
const _1 = require(".");
let Admin = class Admin extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Admin.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Admin.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Admin.prototype, "registerStartDT", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Admin.prototype, "registerEndDT", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Admin.prototype, "challengeStartDT", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Admin.prototype, "challengeEndDT", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Admin.prototype, "generation", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Admin.prototype, "limitNum", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Admin.prototype, "applyNum", void 0);
__decorate([
    sequelize_typescript_1.Default("https://o2-server.s3.ap-northeast-2.amazonaws.com/origin/default_img_100%403x.jpg"),
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Admin.prototype, "img", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    sequelize_typescript_1.Default(sequelize_1.Sequelize.fn("NOW")),
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Admin.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => _1.Generation),
    __metadata("design:type", Array)
], Admin.prototype, "generations", void 0);
Admin = __decorate([
    sequelize_typescript_1.Table({
        tableName: "Admin",
        freezeTableName: true,
        underscored: false,
        timestamps: false,
        charset: "utf8",
        collate: "utf8_general_ci", // 한국어 설정
    })
], Admin);
exports.default = Admin;
//# sourceMappingURL=Admin.js.map