import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getByProjectAndSituation } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum, InvolvementTypeEnum, getInvolvementSituationList } from '../../types/InvolvementData';
import PainelContainer from "../base/PainelContainer";
import logo from '../../assets/logo-transparente.png';
import { FiSkipBack, FiUser } from "react-icons/fi";

interface InvolvementManagementListProps {
    type: InvolvementTypeEnum;
    title: string;
}

export const InvolvementManagementList: React.FC<InvolvementManagementListProps> = ({ type, title }) => {

    const navigate = useNavigate();
    const [selectedSituation, setSelectedSituation] = useState(InvolvementSituationEnum.Aceito);
    const [involvements, setInvolvements] = useState<InvolvementData[]>([]);
    let { projectId } = useParams();

    const situations = getInvolvementSituationList();

    useEffect(() => {
        load();
    }, [selectedSituation]);

    const load = async () => {
        setInvolvements([]);
        if (selectedSituation) {
            const response = await getByProjectAndSituation(parseInt(projectId ? projectId : "0"), selectedSituation);
            setInvolvements(response?.data);
        }
    }

    const handleClickManageProject = (event: any, project: any) => {
        event.preventDefault();
        event.stopPropagation();
        navigate('/project/detail/' + project.id);
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
                <ul className="divide-y divide-gray-200">
                {involvements.map((involvement) => (
                    <li key={involvement.id} className="py-4 flex">
                        <div className="flex-shrink-0">
                            <FiUser />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">ID do Envolvimento: {involvement.id}</p>
                            <p className="text-sm text-gray-500">Situação: {involvement.situation}</p>
                            <p className="text-sm text-gray-500">Tipo: {involvement.type}</p>
                            <p className="text-sm text-gray-500">ID do Usuário: {involvement.userId}</p>
                            <p className="text-sm text-gray-500">ID do Projeto: {involvement.projectId}</p>
                        </div>
                    </li>
                ))}
            </ul>
            ) : (
                <div className="text-center text-lg m-20 text-purple-600">Carregando informações do projeto...</div>
            )}
        </PainelContainer>
    );
}