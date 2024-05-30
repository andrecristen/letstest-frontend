import React, { useEffect, useState } from 'react';
import PainelContainer from '../../components/PainelContainer';
import DeviceForm from './DeviceForm';
import DeviceList from './DeviceList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { DeviceData } from '../../models/DeviceData';
import { getMy } from '../../services/deviceService';

const DeviceUserView: React.FC = () => {

    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const updateDeviceList = async () => {
        setLoading(true);
        const response = await getMy();
        setDevices(response?.data);
        setLoading(false);
    };

    useEffect(() => {
        updateDeviceList();
    }, []);

    return (
        <PainelContainer>
            <LoadingOverlay show={loading} />
            <DeviceForm onDeviceAdded={updateDeviceList} />
            <DeviceList devices={devices} onDelete={updateDeviceList} />
        </PainelContainer>
    );
};

export default DeviceUserView;
