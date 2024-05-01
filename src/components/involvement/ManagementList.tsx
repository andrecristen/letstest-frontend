import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getByProjectAndSituation, accept, reject, remove, invite } from '../../services/involvementService';
import {
    InvolvementData,
    InvolvementSituationEnum,
    InvolvementTypeEnum,
    getInvolvementSituationList,
} from '../../types/InvolvementData';
import PainelContainer from '../base/PainelContainer';
import TitleContainer from '../base/TitleContainer';
import { FiCheckCircle, FiMail, FiUserX, FiTrash, FiUser } from 'react-icons/fi';
import notifyService from '../../services/notifyService';

interface InvolvementManagementListProps {
    type: InvolvementTypeEnum;
    title: string;
}

const InvolvementManagementList: React.FC<InvolvementManagementListProps> = ({ type, title }) => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [selectedSituation, setSelectedSituation] = useState<InvolvementSituationEnum>(InvolvementSituationEnum.Aceito);
    const [involvements, setInvolvements] = useState<InvolvementData[]>([]);
    const [loadingInvolvements, setLoadingInvolvements] = useState<boolean>(true);
    const [inviting, setInviting] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');

    let situations = getInvolvementSituationList();
    if (type === InvolvementTypeEnum.Gerente) {
        situations = situations.filter((situation) => situation.id !== InvolvementSituationEnum.Recebido);
    }

    useEffect(() => {
        loadInvolvements();
    }, [selectedSituation]);

    const loadInvolvements = async () => {
        setLoadingInvolvements(true);
        try {
            const response = await getByProjectAndSituation(parseInt(projectId || '0', 10), selectedSituation);
            const filteredInvolvements = response?.data.filter((involvement: InvolvementData) => involvement.type === type) || [];
            setInvolvements(filteredInvolvements);
        } catch (error) {
            console.error('Erro ao carregar envolvimentos:', error);
        } finally {
            setLoadingInvolvements(false);
        }
    };

    const handleSituationChange = (situationId: InvolvementSituationEnum | null) => {
        if (situationId) {
            setSelectedSituation(situationId);
        }
    };

    const handleInvite = async () => {
        setInviting(true);
        if (email.trim() === '') {
            notifyService.info('Preencha o e-mail para enviar o convite.');
            setInviting(false);
            return;
        }

        try {
            const response = await invite(parseInt(projectId || '0', 10), email, type);
            if (response?.status === 201) {
                notifyService.success('Convite enviado.');
                loadInvolvements();
            } else {
                notifyService.error('Erro ao enviar convite.');
            }
        } catch (error) {
            notifyService.error('Erro ao enviar convite.');
        }

        setEmail('');
        setInviting(false);
    };

    const handleRemove = async (involvement: InvolvementData) => {
        await remove(involvement.id);
        loadInvolvements();
    }

    const handleAccept = async (involvement: InvolvementData) => {
        await accept(involvement.id);
        setSelectedSituation(InvolvementSituationEnum.Aceito);
    }

    const handleReject = async (involvement: InvolvementData) => {
        await reject(involvement.id);
        setSelectedSituation(InvolvementSituationEnum.Rejeitado);
    }

    const renderInvolvementCard = (involvement: InvolvementData) => (
        <div
            key={involvement.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 flex justify-between items-center"
        >
            <div className="flex items-center">
                <FiUser className="text-purple-700 w-6 h-6" />
                <div className="ml-3">
                    <p className="text-sm font-bold text-purple-800">#: {involvement.id}</p>
                    <p className="text-sm text-purple-500">ID do Usuário: {involvement.userId}</p>
                </div>
            </div>
            <div className="flex">
                {selectedSituation === InvolvementSituationEnum.Recebido && (
                    <>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                            onClick={() => handleReject(involvement)}
                            title="Rejeitar"
                        >
                            <FiUserX />
                        </button>
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => handleAccept(involvement)}
                            title="Aceitar"
                        >
                            <FiCheckCircle />
                        </button>
                    </>
                )}
                {selectedSituation !== InvolvementSituationEnum.Recebido && (
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleRemove(involvement)}
                        title="Excluir"
                    >
                        <FiTrash />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <PainelContainer>
            <TitleContainer title={title} />

            <div className="flex flex-wrap border-b mb-4">
                {situations.map((situation) => (
                    <div
                        key={situation.id}
                        className={`cursor-pointer py-2 px-4 text-center ${selectedSituation === situation.id
                            ? 'text-purple-700 font-semibold border-b-4 border-purple-400'
                            : 'text-gray-600 hover:text-purple-600'
                            }`}
                        onClick={() => handleSituationChange(situation.id)}
                    >
                        {situation.name}
                    </div>
                ))}
            </div>

            {selectedSituation === InvolvementSituationEnum.Enviado && (
                <div className="w-full flex items-center mt-4">
                    <input
                        type="email"
                        disabled={inviting}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-mail do usuário para convite"
                        className="h-12 w-10/12 border border-purple-400 rounded-l py-2 px-3 focus:outline-none"
                    />
                    <button
                        disabled={inviting}
                        className="h-12 w-2/12 bg-purple-600 text-white flex items-center justify-center rounded-r hover:bg-purple-700 transition-colors"
                        onClick={handleInvite}
                    >
                        <FiMail className="w-6 h-6" />
                    </button>
                </div>
            )}

            {loadingInvolvements ? (
                <div className="text-center text-purple-600">Carregando envolvimentos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {involvements.length > 0 ? (
                        involvements.map((involvement) => renderInvolvementCard(involvement))
                    ) : (
                        <div className="text-center text-purple-600 col-span-full">
                            {selectedSituation === InvolvementSituationEnum.Recebido
                                ? 'Nenhuma candidatura recebida'
                                : 'Nenhum envolvimento com o projeto para a situação selecionada'}
                        </div>
                    )}
                </div>
            )}
        </PainelContainer>
    );
};

export default InvolvementManagementList;