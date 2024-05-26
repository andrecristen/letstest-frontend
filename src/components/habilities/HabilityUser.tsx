import React, { useEffect, useState } from 'react';
import PainelContainer from '../base/PainelContainer';
import HabilityForm from './HabilityForm';
import HabilityList from './HabilityList';
import LoadingOverlay from '../base/LoadingOverlay';
import { HabilityData } from '../../types/HabilityData';
import { getMy } from '../../services/habilityService';

const HabilityUser: React.FC = () => {
    const [habilities, setHabilities] = useState<HabilityData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const updateHabilityList = async () => {
        setLoading(true);
        const response = await getMy();
        setHabilities(response?.data);
        setLoading(false);
    };

    useEffect(() => {
        updateHabilityList();
    }, []);

    return (
        <PainelContainer>
            <LoadingOverlay show={loading} />
            <HabilityForm onHabilityAdded={updateHabilityList} />
            <HabilityList habilities={habilities} onDelete={updateHabilityList} />
        </PainelContainer>
    );
};

export default HabilityUser;
