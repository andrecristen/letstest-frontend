import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvolvementInvitations, getInvolvementApplied } from '../../services/involvementService';
import { InvolvementData } from '../../types/InvolvementData';
import PainelContainer from '../base/PainelContainer';
import LoadingOverlay from '../base/LoadingOverlay';
import InvolvementPendingList from './InvolvementPendingList';

const InvolvementPendingView: React.FC = () => {
    const navigate = useNavigate();
    const [invitations, setInvitations] = useState<InvolvementData[]>([]);
    const [applies, setApplies] = useState<InvolvementData[]>([]);
    const [loadingInvolvements, setLoadingInvolvements] = useState<boolean>(true);

    useEffect(() => {
        loadInvolvements();
    }, []);

    const loadInvolvements = async () => {
        setLoadingInvolvements(true);
        const responseInvitations = await getInvolvementInvitations();
        setInvitations(responseInvitations?.data);
        const responseApplies = await getInvolvementApplied();
        setApplies(responseApplies?.data);
        setLoadingInvolvements(false);
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingInvolvements} />
            <InvolvementPendingList key={1} title="Convites Recebidos" involvements={invitations} />
            <InvolvementPendingList key={2} title="Solicitações Enviadas" involvements={applies} />
        </PainelContainer>
    );
};

export default InvolvementPendingView;