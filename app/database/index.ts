//Interfaces
import { Database } from '../interfaces';

//Models
import { SubjectModel, SubscriptionModel } from '../models';

//Database
import { SubjectInMemory } from './inmemory.subject';
import { SubscriptionInMemory } from './inmemory.subscription';

export function instanceSubscriptionDatabase(name: string): Database<SubscriptionModel> {
    if('in-memory') {
        return new SubscriptionInMemory();
    }
    return {} as Database<SubscriptionModel>;
}

export function instanceSubjectDatabase(name: string): Database<SubjectModel>{
    if('in-memory') {
        return new SubjectInMemory();
    }
    return {} as Database<SubjectModel>;
}

export { SubjectInMemory } from './inmemory.subject';
export { SubscriptionInMemory } from './inmemory.subscription';