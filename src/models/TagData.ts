import { TagValueData } from "./TagValueData";

export type TagData = {
    id: number;
    name: string;
    situation: number;
    commentary?: string | null;
    projectId?: number | null;
    tagValues?: TagValueData[] | null;
};