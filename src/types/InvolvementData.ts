export type InvolvementData = {
    id: number;
    situation: number;
    type: number;
    userId: number;
    projectId: number;
}

export enum InvolvementSituationEnum {
    Aceito = 4,
    Enviado = 2,
    Recebido = 1,
    Rejeitado = 3,
}

export const getInvolvementSituationList = () => {
    return Object.keys(InvolvementSituationEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: InvolvementSituationEnum[key as keyof typeof InvolvementSituationEnum] ? InvolvementSituationEnum[key as keyof typeof InvolvementSituationEnum] : null }));
}

export enum InvolvementTypeEnum {
    Testador = 1,
    Gerente = 2,
}