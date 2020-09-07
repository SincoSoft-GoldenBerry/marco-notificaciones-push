//Models
import { SubscriptionModel } from "./";

export interface SubjectModel {
    name: string;
    subscriptions: Map<string, SubscriptionModel>
}