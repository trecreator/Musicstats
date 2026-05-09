import mysql from 'mysql2/promise';

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'INVALID_HOST',
  user: process.env.DB_USER || 'INVALID_USER',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'INVALID_DB',
  port: Number(process.env.DB_PORT || 3307),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});