import mysql from 'mysql2/promise';

let pool: mysql.Pool;

export const getByzisDb = () => {
  const config = useRuntimeConfig()
  
  if (!pool) {
    pool = mysql.createPool({
      host: config.byzisHost,
      user: config.byzisUser,
      password: config.byzisPassword,
      database: config.byzisName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
};
