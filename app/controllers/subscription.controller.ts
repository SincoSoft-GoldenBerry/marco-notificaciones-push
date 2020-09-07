//Node packages
import { Response, Request } from 'express';

//Interfaces
import { Database, Controller } from '../interfaces';

//Models
import { SubjectModel, ResponseModel, ResponseStatusCode, SubscriptionModel } from '../models';

//Utils
import { Guid } from '../utils';

export class SubscriptionController extends Controller {
    path: string = '/subscribe';

    constructor(private database: Database<SubscriptionModel>) {
        super();
        this.initializeRoutes();
    }

    initializeRoutes(): void {
        this.router.post('/', this.saveSubscription);
        this.router.post('/subject', this.saveSubjectSubscription);
        this.router.delete('/:id', this.deleteSubscription);
        this.router.get('/:pass', this.getAllSubscriptions);
        this.router.get('/:id/:pass', this.getSubscription);
    }

    private saveSubscription = async (request: Request, response: Response<ResponseModel>) => {
        const subscription: SubscriptionModel = request.body as SubscriptionModel;
        if (subscription.subjects && subscription.subjects.size === 0) {
            response.sendStatus(ResponseStatusCode.Unathorized);
        }
        else {
            try {
                const id: Guid | string | null = await this.database.save(subscription);
                if (id)
                    response.json({ message: 'success', id: id.toString() } as ResponseModel);
                else
                    response.sendStatus(ResponseStatusCode.BadRequest);
            }
            catch (e) {
                response.status(ResponseStatusCode.InternalServerError).json(e);
            }
        }
    }

    private saveSubjectSubscription = async (request: Request, response: Response<ResponseModel>) => {
        try {
            const subs = new Map<string, SubjectModel>();
            subs.set(request.body.name, { name: request.body.name } as SubjectModel);
            const id: Guid | string | null = await this.database.save({ 
                id: Guid.parse(request.body.id), 
                subjects: subs
            } as SubscriptionModel);
            if (id)
                response.json({ message: 'success', id: id.toString() } as ResponseModel);
            else
                response.sendStatus(400);
        }
        catch (e) {
            response.status(500).json(e);
        }
    }

    private deleteSubscription = async (request: Request, response: Response<ResponseModel>) => {
        const id: Guid = Guid.parse(request.params.id);
        try {
            await this.database.delete(id);
            response.status(200).json({ message: 'success' } as ResponseModel);
        }
        catch (e) {
            response.json(e);
            response.sendStatus(500);
        }
    }

    private getAllSubscriptions = async (request: Request, response: Response<Array<SubscriptionModel>>) => {
        const { pass } = request.params;
        if (pass === 'sinco123') {
            try {
                const subscriptions: Array<SubscriptionModel> = await this.database.getAll();
                response.status(200).json(subscriptions);
            }
            catch (e) {
                response.status(500).json(e);
            }
        }
        else {
            response.sendStatus(401);
        }
    }

    private getSubscription = async (request: Request, response: Response<SubscriptionModel | null>) => {
        const { pass, id: idReq } = request.params;
        if (pass === 'sinco123') {
            try {
                const id: Guid = Guid.parse(idReq);
                const subscription: SubscriptionModel | null = await this.database.get(id);
                response.status(200).json(subscription);
            }
            catch (e) {
                response.status(500).json(e);
            }
        }
        else {
            response.sendStatus(401);
        }
    }
}