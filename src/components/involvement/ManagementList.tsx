import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getByProjectAndSituation, accept, reject, remove } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum, InvolvementTypeEnum, getInvolvementSituationList } from '../../types/InvolvementData';
import PainelContainer from "../base/PainelContainer";
import logo from '../../assets/logo-transparente.png';
import { FiCheckCircle, FiSkipBack, FiTrash, FiUser, FiUserX } from "react-icons/fi";
import notifyService from "../../services/notifyService";

interface InvolvementManagementListProps {
    type: InvolvementTypeEnum;
    title: string;
}

export const InvolvementManagementList: React.FC<InvolvementManagementListProps> = ({ type, title }) => {

    const navigate = useNavigate();
    const [selectedSituation, setSelectedSituation] = useState(InvolvementSituationEnum.Aceito);
    const [involvements, setInvolvements] = useState<InvolvementData[]>([]);
    const [loadingInvolvements, setloadingInvolvements] = useState<boolean>(false);
    let { projectId } = useParams();

    const situations = getInvolvementSituationList();

    useEffect(() => {
        load();
    }, [selectedSituation]);

    const load = async () => {
        setInvolvements([]);
        setloadingInvolvements(true);
        if (selectedSituation) {
            const response = await getByProjectAndSituation(parseInt(projectId ? projectId : "0"), selectedSituation);
            const involvements = response?.data;
            const filteredInvolvements = involvements.filter((involvement: InvolvementData) => involvement.type === type);
            setInvolvements(filteredInvolvements);
        }
        setloadingInvolvements(false);
    }

    const handleClickReject = async (event: any, involvementId: number) => {
        event.preventDefault();
        event.stopPropagation();
        const response = await reject(involvementId);
        if (response?.status == 200) {
            notifyService.success("Candidatura rejeitada");
            setSelectedSituation(InvolvementSituationEnum.Rejeitado);
        } else {
            notifyService.error("Erro ao rejeitar candidatura, tente novamente");
        }
    }

    const handleClickAccept = async (event: any, involvementId: number) => {
        event.preventDefault();
        event.stopPropagation();
        const response = await accept(involvementId);
        if (response?.status == 200) {
            notifyService.success("Candidatura aceita");
            setSelectedSituation(InvolvementSituationEnum.Aceito);
        } else {
            notifyService.error("Erro ao aceitar candidatura, tente novamente");
        }
    }

    const handleClickDelete = async (event: any, involvementId: number) => {
        event.preventDefault();
        event.stopPropagation();
        const response = await remove(involvementId);
        if (response?.status == 200) {
            notifyService.success("Envolvimento com projeto excluído");
            load();
        } else {
            notifyService.error("Erro ao excluir envolvimento, tente novamente");
        }
    }

    return (
        <PainelContainer>
            <div className="bg-purple-600 rounded-lg h-16 m-4 p-4">
                <h1 className="float-left text-2xl text-white font-bold">{title}</h1>
                <button onClick={() => { navigate(-1) }} className="float-right bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    <FiSkipBack className="w-4 h-4" />
                </button>
            </div>
            <ul className="w-full flex border-b mt-1">
                {situations.map((situation: any) => (
                    <li onClick={() => { setSelectedSituation(situation.id) }} className="w-full -mb-px">
                        <a className={"w-full bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 " + (situation.id == selectedSituation ? "border-b-4 border-b-purple-400 text-purple-700 font-semibold" : "text-purple-600 hover:text-purple-600 hover:font-semibold")} href="#">{situation.name}</a>
                    </li>
                ))}
            </ul>
            {involvements.length ? (
                <ul className="divide-y divide-purple-200">
                    {involvements.map((involvement) => (
                        <li key={involvement.id} className="py-4 flex">
                            <div className="flex-shrink-0">
                                <FiUser className="text-lg" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900">ID do Envolvimento: {involvement.id}</p>
                                <p className="text-sm text-purple-500">Situação: {involvement.situation}</p>
                                <p className="text-sm text-purple-500">Tipo: {involvement.type}</p>
                                <p className="text-sm text-purple-500">ID do Usuário: {involvement.userId}</p>
                                <p className="text-sm text-purple-500">ID do Projeto: {involvement.projectId}</p>
                            </div>
                            {involvement.situation == InvolvementSituationEnum.Recebido ? (
                                <div className="ml-auto flex">
                                    <button onClick={(event) => { handleClickReject(event, involvement.id) }} className="mr-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" title="Rejeitar">
                                        <FiUserX />
                                    </button>
                                    <button onClick={(event) => { handleClickAccept(event, involvement.id) }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" title="Confirmar">
                                        <FiCheckCircle />
                                    </button>
                                </div>
                            ) : ""}

                            {involvement.situation != InvolvementSituationEnum.Recebido ? (
                                <div className="ml-auto flex">
                                    <button onClick={(event) => { handleClickDelete(event, involvement.id) }} className="mr-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" title="Excluir">
                                        <FiTrash />
                                    </button>
                                </div>
                            ) : ""}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-lg m-20 text-purple-600">{loadingInvolvements ? "Carregando informações do projeto..." : "Nenhuma candidatura"}</div>
            )}
        </PainelContainer>
    );
}