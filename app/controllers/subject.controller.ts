//Node packages
import { Response, Request } from 'express';

//Interfaces
import { Database, Controller } from '../interfaces';

//Models
import { SubjectModel, ResponseModel, ResponseStatusCode } from '../models';

//Utils
import { Guid, filterParam, TextParam, ParamType } from '../utils';

export class SubjectController extends Controller {
    path: string = '/subject';

    constructor(private database: Database<SubjectModel>) {
        super();
        this.initializeRoutes();
    }

    initializeRoutes(): void {
        const filters: Array<ParamType> = [
            new TextParam('pass', 'sinco123')
        ] as Array<ParamType>;

        this.router.post('/', this.saveSubject);
        this.router.get('/:pass', filterParam(filters), this.getAllSubjects);
    }

    private saveSubject = async (request: Request, response: Response<ResponseModel>) => {
        const subject: SubjectModel = request.body as SubjectModel;
        try {
            const name: Guid | string | null = await this.database.save(subject);
            if (name)
                response.json({ message: 'Correcto', name: name.toString() } as ResponseModel);
            else
                response.sendStatus(ResponseStatusCode.BadRequest);
        }
        catch (e) {
            response.status(ResponseStatusCode.InternalServerError).json(e);
        }
    }

    private getAllSubjects = async (request: Request, response: Response<Array<SubjectModel>>) => {
        try {
            const subjects: Array<SubjectModel> = await this.database.getAll();
            response.json(subjects);
        }
        catch (e) {
            response.status(ResponseStatusCode.InternalServerError).json(e);
        }
    }
}