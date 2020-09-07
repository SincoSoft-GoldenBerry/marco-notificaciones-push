//Node packages
import { NextFunction, Response } from 'express';

/**
 * Enumerador para el tipo de entorno.
 * @enum
 */
export enum EnvironmentType {
    Produccion = 'produccion',
    Pruebas = 'pruebas',
    Replica = 'replica',
    Todos = 'todos'
}

/**
 * Clase abstracta que expone funcionalidades para la validación de parámetros de url.
 * @abstract
 * @class
 * @public
 */
export abstract class ParamType {
    /**
     * @property {string} name Nombre del parámetro de la url.
     * @public
     */
    name: string;

    /**
     * @property {string} expression Expresión regular que se usará para evaluar el valor del parámetro de la url.
     * @public
     */
    expression: string;

    /**
     * @constructor
     * 
     * @param name Nombre del parámetro de la url.
     * @param expression Expresión regular que se usará para evaluar el valor del parámetro de la url.
     */
    constructor(name: string, expression: string) {
        this.name = name;
        this.expression = expression;
    }

    /**
     * Evalúa el valor del parámetro con la expresión dada.
     * 
     * @param {string} text Valor del parámetro de url que se evaluará.
     * @returns {boolean} resultado de la evaluación.
     * @public
    */
    evaluate = (text: string): boolean => new RegExp(this.expression, 'i').test(text);

    /**
     * @abstract Método a implementar que convierte el valor del parámetro de url a un tipo especificado por la implementación específica.
     * 
     * @param {string} text Valor del parámetro de url que se convertirá.
     * @returns {any} Resultado de convertir el valor del parámetro de url con la implementación específica. 
     */
    abstract parse(text: string): any;
}

/**
 * Clase que implementa la funcionalidad de "ParamType" para los parámetros de tipo "enum"
 * @generic {string | number} T 
 * @extends ParamType
 * @class
 * @public
 */
export class EnumParam<T extends string | number> extends ParamType {
    
    /**
     * @constructor
     * 
     * @param name Nombre del parámetro de la url.
     * @param expression Expresión regular para evaluar si el valor es "enum".
     */
    constructor(name: string, expression: string) {
        super(name, expression);
    }

    /**
     * Implementación del mpetodo de la clase "ParamType"
     * @see {ParamType.parse}
     * @param {string} text Valor del parámetro de url que se convertirá a "enum".
     * @returns {T} Tipo del enumerador
     * @implements
     */
    parse = (text: string): T => <T>text.toLowerCase();
}

/**
 * Clase que implementa la funcionalidad de "ParamType" para los parámetros de tipo "number"
 * @extends ParamType
 * @class
 * @public
 */
export class NumberParam extends ParamType {
    
    /**
     * @constructor
     * 
     * @param name Nombre del parámetro de la url.
     * @param expression Expresión regular para evaluar si el valor es "number".
     */
    constructor(name: string, expression: string) {
        super(name, expression);
    }

    /**
     * Implementación del mpetodo de la clase "ParamType"
     * @see {ParamType.parse}
     * @param {string} text Valor del parámetro de url que se convertirá a "number".
     * @returns {number}
     * @implements
     */
    parse = (text: string): number => parseInt(text);
}


/**
 * Clase que implementa la funcionalidad de "ParamType" para los parámetros de tipo "string"
 * @extends ParamType
 * @class
 * @public
 */
export class TextParam extends ParamType {

    /**
     * @constructor
     * 
     * @param name Nombre del parámetro de la url.
     * @param expression Expresión regular para evaluar si el valor es "string".
     */
    constructor(name: string, expression: string) {
        super(name, expression);
    }

    /**
     * Implementación del mpetodo de la clase "ParamType"
     * @see {ParamType.parse}
     * @param {string} text Valor del parámetro de url que se convertirá a "string".
     * @returns {string}
     * @implements
     */
    parse = (text: string): string => text;
}

/**
 * Clase que implementa la funcionalidad de "ParamType" para los parámetros de tipo "object"
 * @extends ParamType
 * @class
 * @public
 */
export class ObjectParam extends ParamType {
    
    /**
     * @constructor
     * 
     * @param name Nombre del parámetro de la url.
     * @param expression Expresión regular para evaluar si el valor es "object".
     */
    constructor(name: string, expression: string) {
        super(name, expression);
    }

    /**
     * Implementación del mpetodo de la clase "ParamType"
     * @see {ParamType.parse}
     * @param {string} text Valor del parámetro de url que se convertirá a "object".
     * @returns {object}
     * @implements
     */
    parse = (text: string): object => text && text !== '' ? JSON.parse(text) : null;
}

/**
 * Filtro que ejecutará todos los criterios del arreglo de "ParamType" en el request.
 * @param {Array<ParamType>} params Lista de instancias de la clase "ParamType" para filtrar los request.
 * @returns {Function} Función que se ejecutará en el router.
 * @public
 */
export const filterParam = (params: Array<ParamType>) => (req: any, res: Response, next: NextFunction): void => {
    let param: ParamType;
    for(let i = 0; i < params.length; i++) {
        param = params[i];
        if (param.evaluate(req.params[param.name])){
            req.params[param.name] = param.parse(req.params[param.name]);
        }
        else {
            next(new Error(JSON.stringify({
                'error': true,
                'param': param.name,
                'value': req.params[param.name],
                'expression': param.expression
            })));
            break;
        }
    }
    next();
};