import { Pool } from 'pg';
import { Repository } from '../interfaces/repository.interface';

const getRepository = <T>(
    db: Pool,
    repository: new (db: Pool) => Repository<T>,
): Repository<T> => {
    return new repository(db);
};

export default getRepository;
