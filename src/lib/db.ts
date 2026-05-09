import mysql from 'mysql2/promise';

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error(
    `Missing DB env vars: ${JSON.stringify({
      DB_HOST: !!DB_HOST,
      DB_PORT: !!DB_PORT,
      DB_USER: !!DB_USER,
      DB_PASSWORD: !!DB_PASSWORD,
      DB_NAME: !!DB_NAME,
    })}`
  );
}

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});