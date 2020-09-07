//Node packages
import { NextFunction, Request, Response } from 'express';

//Exceptions
import HttpException from '../exceptions/HttpException';

export function errorMiddleware (error: HttpException, request: Request, response: Response, next: NextFunction) {
    response.sendStatus(error.status || 500);
};