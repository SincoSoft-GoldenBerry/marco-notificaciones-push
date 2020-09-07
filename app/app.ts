// Node packages
import cors from 'cors';
import express from 'express';
import * as bodyParser from 'body-parser';
import { NextHandleFunction } from 'connect';
import { OptionsUrlencoded } from 'body-parser';
const debug = require('debug')('marco-notificaciones-push:server');
const http = require('http');

//Controllers
import { Controller } from './interfaces';

//Middlewares
import { errorMiddleware } from './middleware';

export default class App {
    private app: express.Application;
    private port: number;
    private server: any;
    private requestHandler: express.RequestHandler;
    private bodyHandler: NextHandleFunction;
    private urlHandler: NextHandleFunction;

    constructor(controllers?: Array<Controller>) {
        this.app = express();
        this.requestHandler = cors();
        this.bodyHandler = bodyParser.json();
        this.urlHandler = express.urlencoded({ extended: false } as OptionsUrlencoded);
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.port = parseInt(process.env.PORT || '3000');
        this.app.set('port', this.port);
        this.server = http.createServer(this.app);
    }

    private initializeMiddlewares(): void {
        this.app.use(this.requestHandler);
        this.app.use(this.bodyHandler);
        this.app.use(this.urlHandler);
        this.app.use(errorMiddleware);
    }

    private initializeControllers(controllers?: Array<Controller>): void {
        controllers?.forEach(controller => {
            this.app.use(controller.path, controller.router);
        });

        const errorHandler = function(err: any, req: any, res: any, next: any) {
            res.status(500);
            if (err.message) {
                res.json(JSON.parse(err.message));
            }
            res.end();
        };

        this.app.use(errorHandler);
    }

    private onError = (error: any): void => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof this.port === 'string'
            ? 'Pipe ' + this.port
            : 'Port ' + this.port;

        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    private onListening = (): void => {
        const addr = this.server.address();
        const bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug(`Listening on ${bind}`);
    }

    run(): void {
        this.server.listen(this.port);
        this.server.on('error', this.onError);
        this.server.on('listening', this.onListening);
        console.log('Corriendo en http://localhost:3000');
    }
}