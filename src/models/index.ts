import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import User from "./User";
import Admin from "./Admin";
import Badge from "./Badge";
import Challenge from "./Challenge";
import Concert from "./Concert";
import Generation from "./Generation";
import Like from "./Like";
import Post from "./Post";
import Scrap from "./Scrap";
import Comment from "./Comment";
const db = {};

dotenv.config();

export const sequelize = new Sequelize(
  // config.development.database,
  // config.development.username,
  // config.development.password,
  {
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_DBNAME,
    dialect: "mysql",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: false,
    timezone: "+09:00",
  }
);

sequelize.addModels([
  Admin,
  Badge,
  Challenge,
  Concert,
  Generation,
  Like,
  Post,
  Scrap,
  User,
  Comment,
]);

export {
  Admin,
  Badge,
  Challenge,
  Concert,
  Generation,
  Like,
  Post,
  Scrap,
  User,
  Comment,
};
export default sequelize;
