import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { User } from "./users.js";

export const Token = sequelize.define("Token", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);
