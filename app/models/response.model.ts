export interface ResponseModel {
    message: string;
    [propName: string]: any;
}

export enum ResponseStatusCode {
    BadRequest = 400,
    Unathorized = 401,
    NotFound = 404,
    InternalServerError = 500
}