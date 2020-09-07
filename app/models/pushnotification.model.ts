import { EnvironmentType } from '../utils';

export class PushNotificationModel {
    public entorno: EnvironmentType;
    public origen: number;
    public empresa: number;
    public perfil: number;
    public command: string;
    public adicional: string | null;

    constructor({ 
        entorno = EnvironmentType.Todos,
        origen = -1,
        empresa = -1,
        perfil = -1,
        command = '',
        adicional = null 
    }: { entorno: EnvironmentType, origen: number, empresa: number, perfil: number, command: string, adicional: string | null }) {
        this.entorno = entorno;
        this.origen = origen;
        this.empresa = empresa;
        this.perfil = perfil;
        this.command = command;
        this.adicional = adicional;
    }
}