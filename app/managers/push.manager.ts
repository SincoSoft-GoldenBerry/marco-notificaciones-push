//Node packages
import WebPush from 'web-push';

//Models
import { SubscriptionModel, PushNotificationModel } from '../models';

export class PushManager {
    private subject: string = 'https://www.sinco.com.co';
    private publicKey: string = 'BABU69DGxW0-rzUdEYDGG2xHAMQROl5RV8QD6Zuxjdoj5RBOcZKGLKw4D_YglTMBjyuL5rdTPyl_I64rnKKuKkc';
    private privateKey: string = 'SWDFhVNnV2clDdQiFls2k7AWtr3dkK5oU5YWdaNPVsM';

    constructor() {
        WebPush.setVapidDetails(this.subject, this.publicKey, this.privateKey);
    }

    async sendPushNotification(subscription: SubscriptionModel, data?: any | string | Buffer | null | undefined, options?: WebPush.RequestOptions | undefined): Promise<WebPush.SendResult | void> {
        try {
            if (!!data && data instanceof PushNotificationModel){
                return await WebPush.sendNotification(subscription as WebPush.PushSubscription, JSON.stringify(data), options);
            }
            return await WebPush.sendNotification(subscription as WebPush.PushSubscription, data as string | Buffer | null | undefined, options);
        }
        catch(e) {
            //console.log('Intento fallido!');
        }
    }
}