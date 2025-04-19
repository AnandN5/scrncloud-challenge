import { db_host, db_port, db_name, db_user, db_password } from './config';
import { Pool } from 'pg';

const dbConnection = new Pool({
    host: db_host,
    port: db_port,
    database: db_name,
    user: db_user,
    password: db_password,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    max: 5
});

export default dbConnection;
