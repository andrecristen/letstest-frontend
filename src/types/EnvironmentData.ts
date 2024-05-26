export type EnvironmentData = {
    id: number;
    name: string;
    description: string;
    situation: number;
}

export enum EnvironmentSituation {
    Operante = 1,
    Inoperante = 2,
}


export const getEnvironmentSituationList = () => {
    return Object.keys(EnvironmentSituation)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: EnvironmentSituation[key as keyof typeof EnvironmentSituation] }));
}

export const getEnvironmentSituationDescription = (value: number): string | undefined => {
    const description = Object.keys(EnvironmentSituation)
        .find(key => EnvironmentSituation[key as keyof typeof EnvironmentSituation] === value);
    return description ? description : undefined;
}
