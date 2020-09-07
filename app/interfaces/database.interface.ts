//Utils
import { Guid } from '../utils';

export abstract class Database<T> {

    constructor() {
        require('dotenv').config();
        this.init();
    }

    abstract connect(): Promise<any>;
    abstract save(obj: T): Promise<Guid | string | null>;
    abstract delete(id: Guid | string): Promise<number>;
    abstract get(id: Guid | string): Promise<T | null>;
    abstract getAll(): Promise<Array<T>>;
    abstract init(): Promise<void>;
}