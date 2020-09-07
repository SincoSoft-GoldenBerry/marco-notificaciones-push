import App from './app';

import { EmptyController, NotificationController, SubjectController, SubscriptionController } from './controllers';

import { Database } from './interfaces';
import { SubscriptionModel, SubjectModel } from './models';
import { instanceSubscriptionDatabase, instanceSubjectDatabase } from './database';

const database_class: string = process.env.database_class as string;

const _databaseSubscription: Database<SubscriptionModel> = instanceSubscriptionDatabase(database_class);
const _databaseSubject: Database<SubjectModel> = instanceSubjectDatabase(database_class);

const appInstance: App = new App([
    new SubscriptionController(_databaseSubscription),
    new NotificationController(_databaseSubject),
    new SubjectController(_databaseSubject),
    new EmptyController()
]);

appInstance.run();