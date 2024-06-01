import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvolvementInvitations, getInvolvementApplied } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum } from '../../models/InvolvementData';
import PainelContainer from '../../components/PainelContainer';
import LoadingOverlay from '../../components/LoadingOverlay';
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
            <InvolvementPendingList callback={loadInvolvements} typeSituation={InvolvementSituationEnum.Recebido} key={1} title="Convites Recebidos" textHelp="Convites enviados à você pelos gerentes de projetos"involvements={invitations} />
            <InvolvementPendingList callback={loadInvolvements} typeSituation={InvolvementSituationEnum.Enviado} key={2} title="Solicitações Enviadas" textHelp="Solicitações de participação enviados por você aos gerentes dos projetos" involvements={applies} />
        </PainelContainer>
    );
};

export default InvolvementPendingView;