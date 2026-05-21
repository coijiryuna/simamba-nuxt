import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const getDb = () => {
  const config = useRuntimeConfig()
  
  if (!pool) {
    pool = mysql.createPool({
      host: config.databaseHost,
      user: config.databaseUser,
      password: config.databasePassword,
      database: config.databaseName,
      port: Number(config.databasePort || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};
