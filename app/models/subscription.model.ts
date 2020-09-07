//Models
import { SubjectModel, SubscriptionKey, Environment } from './';

//Utils
import { Guid } from '../utils';

export interface SubscriptionModel {
    endpoint: string;
    expirationTime: number | null;
    keys: SubscriptionKey;
    subjects: Map<string, SubjectModel>;
    date: Date;
    environment: Environment;
    id: Guid;
}