import mysql from "mysql2/promise";
import { configDaDatabaseUrl } from "@/lib/dbUri";

const deNuvem = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;

const poolConfig = process.env.DATABASE_URL
  ? configDaDatabaseUrl(process.env.DATABASE_URL)
  : deNuvem
    ? {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: { rejectUnauthorized: false },
      }
    : { host: "127.0.0.1" };

const globalForMysql = globalThis as unknown as {
  conexao: mysql.Pool | undefined;
};

export const conexao = globalForMysql.conexao ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForMysql.conexao = conexao;
}
