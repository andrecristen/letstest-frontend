export interface DeviceData {
    id?: number;
    type: number;
    brand: string;
    model: string;
    system: string;
    userId?: number;
}

export enum DeviceType {
    Smartphone = 1,
    Notebook = 2,
    Desktop = 3,
    Tablet = 4,
    Smartwatch = 4,
}

export const getDeviceTypeList = () => {
    return Object.keys(DeviceType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: DeviceType[key as keyof typeof DeviceType] }));
}

export const getDeviceTypeDescription = (value: number): string | undefined => {
    const description = Object.keys(DeviceType)
        .find(key => DeviceType[key as keyof typeof DeviceType] === value);
    return description ? description : undefined;
}

