//Node packages
import express, { Router } from 'express';

export abstract class Controller {
    abstract path: string;
    readonly router: Router;

    constructor() {
        this.router = express.Router();
    }

    abstract initializeRoutes(): void;
}