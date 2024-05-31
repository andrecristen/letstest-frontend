import { TagValueData } from "./TagValueData";

export type TagData = {
    id: number;
    name: string;
    situation: number;
    commentary?: string | null;
    projectId?: number | null;
    tagValues?: TagValueData[] | null;
};

export enum TagSituation {
    Ativo = 1,
    Arquivado = 2,
}

export const getTagSituationList = () => {
    return Object.keys(TagSituation)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: TagSituation[key as keyof typeof TagSituation] }));
}