//Interfaces
import { DatabaseInmemory } from '../interfaces';

//Models
import { SubjectModel, SubscriptionModel } from '../models';

export class SubjectInMemory extends DatabaseInmemory<SubjectModel> {

    async save(subject: SubjectModel): Promise<string | null> {
        await this.connect();

        if (!this.subjects.has(subject.name)) {
            subject.subscriptions = new Map<string, SubscriptionModel>();

            this.subjects.set(subject.name, subject);

            await this.commit();
        }

        return subject.name;
    }

    async delete(name: string): Promise<number> {
        await this.connect();
        this.subjects.delete(name);
        await this.commit();
        return 1;
    }

    async get(name: string): Promise<any> {
        await this.connect();
        const ret: any = this.subjects.get(name);
        ret.subscriptions = Array.from(ret.subscriptions as Map<string, SubscriptionModel>).map(this.mapSubscription());
        return ret;
    }

    async getAll(): Promise<Array<any>> {
        await this.connect();
        return Array.from(this.subjects)
            .filter(([id]) => id !== '_')
            .map(([_, { name, subscriptions }]) => ({
                name,
                subscriptions: Array.from(subscriptions).map(this.mapSubscription())
            }));
    }
}