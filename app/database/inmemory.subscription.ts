//Interfaces
import { DatabaseInmemory } from '../interfaces';

//Models
import { SubjectModel, SubscriptionModel } from '../models';

//Utils
import { Guid } from '../utils';

export class SubscriptionInMemory extends DatabaseInmemory<SubscriptionModel> {

    async save(subscription: SubscriptionModel): Promise<Guid | null> {
        await this.connect();

        let id: Guid;
        if (!Guid.isGuid(subscription.id)) {
            id = Guid.create();
            subscription.id = id;
            subscription.subjects = new Map<string, SubjectModel>([['_', { name: '_', subscriptions: new Map<string, SubscriptionModel>([[subscription.id.toString(), subscription]]) } as SubjectModel]]);
            if (this.subjects.has('_')) {
                this.subjects.get('_')?.subscriptions.set(id.toString(), subscription);
            }
            else {
                this.subjects.set('_', subscription.subjects.get('_') as SubjectModel);
            }
        }
        else {
            id = subscription.id;

            const subjectsNames = Array.from(subscription.subjects).map(([name]) => name);

            const subjects = Array.from(this.subjects);

            subjects
                .filter(([name]) => subjectsNames.includes(name))
                .forEach(([_, subject]) => {
                    const subs = subjects.find(([_, sub]) => sub.subscriptions.has(id.toString()))?.[1].subscriptions.get(id.toString()) as SubscriptionModel;
                    subject.subscriptions.set(id.toString(), subs);
                });

            subjects.forEach(([_, subject]) => {
                const endPoint = Array.from(subject.subscriptions).map(([_, sub]) => sub).find(sub => sub.id.toString() === id.toString())?.endpoint;

                subject.subscriptions.forEach(sub => {
                    if (sub.id.toString() !== id.toString() && sub.endpoint === endPoint) {
                        this.subjects.get(subject.name)?.subscriptions.delete(sub.id.toString());
                    }
                });
            });

            this.subjects.get('_')?.subscriptions.delete(id.toString());
        }

        await this.commit();
        return id;
    }

    async delete(id: Guid): Promise<number> {
        await this.connect();
        Array.from(this.subjects)
            .forEach(([_, subject]) => 
                subject.subscriptions.delete(id.toString())
            );
        await this.commit();
        return 1;
    }

    async get(id: Guid): Promise<any> {
        await this.connect();
        const subject = <SubjectModel | undefined>Array.from(this.subjects)
                    .find(([_, subject]) => 
                                subject.subscriptions.has(id.toString())
                            )?.[1];

        const data: SubscriptionModel | undefined = subject?.subscriptions.get(id.toString());

        if (data) {
            return this.mapSubscription()([null, data]);
        }
        return undefined;
    }

    async getAll(): Promise<Array<any>> {
        await this.connect();
        const ret = new Map<string, SubscriptionModel>();
        Array.from(this.subjects)
            .forEach(([_, subject]) => 
                Array.from(subject.subscriptions)
                    .forEach(([_, subscription]) => {
                        if (ret.has(subscription.id.toString())) {
                            ret.get(subscription.id.toString())?.subjects.set(subject.name, { name: subject.name } as SubjectModel);
                        }
                        else {
                            subscription.subjects.set(subject.name, { name: subject.name } as SubjectModel);
                            ret.set(subscription.id.toString(), subscription);
                        }
                    })
            )
        return Array.from(ret).map(this.mapSubscription(true));
    }
}