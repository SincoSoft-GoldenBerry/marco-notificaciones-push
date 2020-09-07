//Node packages
import { Request, Response } from 'express';

//Interfaces
import { Controller } from '../interfaces';

//Models
import { ResponseStatusCode } from '../models';

export class EmptyController extends Controller {
    path: string = '*';

    initializeRoutes(): void {
        this.router.get(`/${this.path}`, this.getAllGets);
    }

    private getAllGets(request: Request, response: Response) {
        response.sendStatus(ResponseStatusCode.NotFound);
    }
}