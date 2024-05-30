import React, { useEffect, useState } from 'react';
import PainelContainer from '../../components/PainelContainer';
import HabilityForm from './HabilityForm';
import HabilityList from './HabilityList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { HabilityData } from '../../models/HabilityData';
import { getMy } from '../../services/habilityService';

const HabilityUserView: React.FC = () => {
    
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

export default HabilityUserView;
