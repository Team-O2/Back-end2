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
let Generation = class Generation extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => _1.Admin),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "generation", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "challengeNum", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "conditionNum", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "writingNum", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => _1.User),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Generation.prototype, "userID", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => _1.User),
    __metadata("design:type", _1.User)
], Generation.prototype, "user", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => _1.Admin),
    __metadata("design:type", _1.Admin)
], Generation.prototype, "admin", void 0);
Generation = __decorate([
    sequelize_typescript_1.Table({
        tableName: "Generation",
        freezeTableName: true,
        underscored: false,
        timestamps: false,
        charset: "utf8",
        collate: "utf8_general_ci", // 한국어 설정
    })
], Generation);
exports.default = Generation;
//# sourceMappingURL=Generation.js.map