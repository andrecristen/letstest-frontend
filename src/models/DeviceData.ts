import i18n from "../i18n";

export type DeviceData = {
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

const deviceTypeOptions: Array<{ id: DeviceType; labelKey: string }> = [
    { id: DeviceType.Smartphone, labelKey: "enums.device.smartphone" },
    { id: DeviceType.Notebook, labelKey: "enums.device.notebook" },
    { id: DeviceType.Desktop, labelKey: "enums.device.desktop" },
    { id: DeviceType.Tablet, labelKey: "enums.device.tablet" },
    { id: DeviceType.Smartwatch, labelKey: "enums.device.smartwatch" },
];

export const getDeviceTypeList = () => {
    return deviceTypeOptions.map((option) => ({
        name: i18n.t(option.labelKey),
        id: option.id,
    }));
}

export const getDeviceTypeDescription = (value: number): string | undefined => {
    for (let index = deviceTypeOptions.length - 1; index >= 0; index -= 1) {
        const option = deviceTypeOptions[index];
        if (option.id === value) {
            return i18n.t(option.labelKey);
        }
    }
    return undefined;
}
