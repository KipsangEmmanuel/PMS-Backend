import dotenv from 'dotenv';
import mssql from 'mssql';

dotenv.config({path:'../../.env'});

export const sqlConfig = {
  user: 'sa',
  password: '@SQLserver1258631t',
  database: 'Project_Management',
  server: 'localhost',
  pool: {
    max: 10,
    min: 0, 
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
}

async function testConnection() {
  const pool = await mssql.connect(sqlConfig)

  if(pool.connected) {
    console.log('Database connected successfully!')
  }
}

testConnection()