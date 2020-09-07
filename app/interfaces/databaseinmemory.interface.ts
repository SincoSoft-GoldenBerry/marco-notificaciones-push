//Interfaces
import { Database } from './database.interface';

//Models
import { SubjectModel, SubscriptionModel } from '../models';

//Utils
import * as File from 'fs';

export abstract class DatabaseInmemory<T> extends Database<T> {
    private readonly fileName: string = 'data.json';

    private static subjects: Map<string, SubjectModel>;

    protected get subjects(): Map<string, SubjectModel> {
        return DatabaseInmemory.subjects;
    }

    async init(): Promise<void> {}

    async connect(): Promise<void> {
        const dataMapped = new Map<string, SubjectModel>();
        const data = await File.readFileSync(this.fileName, { encoding: 'utf8' });
        if (data.length > 3) {
            JSON.parse(data)
                .forEach((subject: SubjectModel) => {
                    subject.subscriptions = new Map<string, SubscriptionModel>((<Array<SubscriptionModel>><any>subject.subscriptions).map(subscription => {
                        subscription.subjects = subscription.subjects || new Map<string, SubjectModel>();
                        subscription.subjects.set(subject.name, subject);
                        return [subscription.id.toString(), subscription];
                    }));
                    dataMapped.set(subject.name, subject);
                });
        }
        DatabaseInmemory.subjects = dataMapped;
    }
    
    protected async commit(): Promise<void> {
        const subjects = Array.from(DatabaseInmemory.subjects)
                            .map(([_, { name, subscriptions }]) => ({
                                name,
                                subscriptions: !subscriptions ? [] : Array.from(subscriptions)
                                                    .map(([_, { id, endpoint, expirationTime, date, keys, environment }]) => ({
                                                        id: id.toString(),
                                                        endpoint,
                                                        expirationTime,
                                                        date,
                                                        keys,
                                                        environment
                                                    }))
                            }));
        await File.writeFileSync(this.fileName, JSON.stringify(subjects), { encoding: 'utf8' });
    }

    protected mapSubscription = (toString: boolean = false) => ([_, { id, endpoint, expirationTime, date, keys, subjects, environment }]: any) => ({
        id: id.toString(),
        endpoint,
        expirationTime,
        keys,
        environment,
        date: toString ? new Date(date).toLocaleString() : new Date(date),
        subjects: Array.from(subjects).map(this.mapSubject)
    });

    protected mapSubject = ([_, { name }]: any) => name;
}