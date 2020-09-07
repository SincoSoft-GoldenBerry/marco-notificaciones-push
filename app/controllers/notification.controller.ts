//Node packages
import { Request, Response } from 'express';

//Interfaces
import { Database, Controller } from '../interfaces';

//Models
import { SubjectModel, PushNotificationModel, ResponseModel, ResponseStatusCode, SubscriptionModel } from '../models';

//Managers
import { PushManager } from '../managers';

//Utils
import { filterParam, NumberParam, TextParam, ObjectParam, ParamType, EnumParam, EnvironmentType } from '../utils';

export class NotificationController extends Controller {
    path: string = '/send';

    constructor(private subjectDatabase: Database<SubjectModel>) {
        super();
        this.initializeRoutes();
    }

    initializeRoutes(): void {
        const filters: Array<ParamType> = [
            new EnumParam<EnvironmentType>('entorno', '(pruebas|produccion|replica|todos)+'),
            new NumberParam('origen', '\\d+'),
            new NumberParam('empresa', '\\d+'),
            new NumberParam('perfil', '\\d+'),
            new TextParam('command', '.+'),
            new ObjectParam('adicional', '.?'),
            new TextParam('subject', '.+')
        ] as Array<ParamType>;

        this.router.get('/:subject/:entorno/:origen/:empresa/:perfil/:command/:adicional?', filterParam(filters), this.sendNotification, () => {});
    }

    private sendNotification = async (request: Request, response: Response<ResponseModel>): Promise<void> => {
        const pushManager: PushManager = new PushManager();
        const { subject, ...notificationParam } = request.params;
        const notification: PushNotificationModel = new PushNotificationModel(notificationParam as any);
        try {
            const subjectModel: SubjectModel | null = await this.subjectDatabase.get(subject);

            if (subjectModel && (<Array<SubscriptionModel>><any>subjectModel.subscriptions).length > 0) {

                subjectModel.subscriptions.forEach(subscription => {
                    if (notification.entorno === EnvironmentType.Todos || notification.entorno === subscription.environment.type) {
                        pushManager.sendPushNotification(subscription, notification);
                    }
                });

                response.json({ message: `Mensajes enviados al grupo ${subject}, entorno ${notification.entorno}`, notificados: subjectModel?.subscriptions.size } as ResponseModel);
            }
            else if (!subjectModel) {
                response.sendStatus(ResponseStatusCode.NotFound);
            }
            else {
                response.status(ResponseStatusCode.BadRequest)
                        .json({ message: `No se enviaron los mensajes al grupo ${subject}. No hay suscriptores.`, notificados: 0 } as ResponseModel);
            }
        }
        catch(e) {
            response.status(ResponseStatusCode.InternalServerError).json(e);
        }
    }

}