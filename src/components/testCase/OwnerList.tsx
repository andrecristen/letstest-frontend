import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import { FiCopy, FiExternalLink, FiFileText, FiSearch, } from "react-icons/fi";
import notifyService from "../../services/notifyService";
import { TitleContainer } from "../base/TitleContainer";
import { getAllByProjects } from "../../services/testCaseService";
import { TestCaseData } from "../../types/TestCaseData";


const TestCaseProjectOwnerList = () => {

    const navigate = useNavigate();
    let { projectId } = useParams();

    const [testCases, setTemplates] = useState<TestCaseData[]>([]);
    const [loadingTestCases, setLoadingTestCases] = useState<boolean>(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoadingTestCases(true);
        const response = await getAllByProjects(parseInt(projectId ? projectId : "0"));
        setTemplates(response?.data);
        setLoadingTestCases(false);
    }

    const handleClickNewTestCase = () => {
        navigate("/test-case/" + projectId + "/add");
    }

    const handleClickView = (testCaseId?: number) => {
        navigate("/test-case/" + testCaseId + "/view");
    }

    const handleClickEdit = (testCaseId?: number) => {
        navigate("/test-case/" + testCaseId + "/edit");
    }

    const handleClickTestExecutions = (testCaseId?: number) => {
        navigate("/test-executions/" + testCaseId);
    }

    return (
        <PainelContainer>
            <TitleContainer title="Gerenciar Casos de Teste" />
            <div className="my-4 px-2 flex justify-end items-stretch flex-wrap pb-0 bg-transparent">
                <button
                    type="button"
                    className="py-2 px-12 border border-transparent text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={handleClickNewTestCase}
                >
                    Criar Novo
                </button>
            </div>
            {testCases.length ? (
                <ul className="divide-y border border-gray-300 rounded-lg">
                    {testCases.map((testCase, index) => (
                        <li key={testCase.id} className={`p-6 flex ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`}>
                            <div className="flex-shrink-0">
                                <FiFileText className="text-lg" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900"># {testCase.id}</p>
                                <p className="font-bold text-lg text-purple-700">{testCase.name}</p>
                            </div>
                            <div className="ml-auto flex flex-col">
                                <button onClick={() => { handleClickView(testCase?.id) }} className="m-1 h-8 inline-flex items-center px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 active:bg-teal-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <FiSearch className="h-5 w-5 mr-2" /> Visualizar
                                </button>
                                <button onClick={() => { handleClickEdit(testCase.id) }} className="m-1 h-8 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <FiCopy className="h-5 w-5 mr-2" /> Editar
                                </button>
                                <button onClick={() => { handleClickTestExecutions(testCase.id) }} className="m-1 h-8 inline-flex items-center px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 active:bg-green-800 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <FiExternalLink className="h-5 w-5 mr-2" /> Execuções
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center text-lg m-20 text-purple-600">{loadingTestCases ? "Carregando casos de teste do projeto..." : "Nenhum caso de teste encontrado"}</div>
            )}
        </PainelContainer>
    );
}

export default TestCaseProjectOwnerList;