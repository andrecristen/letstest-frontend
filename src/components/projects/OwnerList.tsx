import React, { useEffect, useRef, useState } from 'react';
import { FiActivity, FiEdit } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getMyProjects } from '../../services/projectService';
import { getProjectSituationDescription, getProjectSituationList } from '../../types/ProjectData';
import { FormDialogBaseExtendsRef } from '../base/FormDialogBase';
import ProjectsForm from './Form';
import PainelContainer from '../base/PainelContainer';
import TitleContainer from '../base/TitleContainer';
import { ProjectData } from '../../types/ProjectData';
import { getProjectVisibilityDescription, getProjectVisibilityList } from '../../types/ProjectData';

function ProjectsOwnerList() {
  const navigate = useNavigate();
  const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

  const [selectedSituation, setSelectedSituation] = useState<number | null>(1);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);

  const situations = getProjectSituationList();
  situations.push({ name: 'Todos', id: null });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await getMyProjects();
      setProjects(response?.data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleClickNewProject = () => {
    formDialogRef.current?.getDialogBase().current.openDialog();
  };

  const handleClickManageProject = (event: React.MouseEvent, project: any) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(`/project/detail/${project.id}`);
  };

  const handleClickEditProject = (event: React.MouseEvent, project: any) => {
    event.preventDefault();
    event.stopPropagation();
    formDialogRef.current?.setData(project);
    formDialogRef.current?.getDialogBase().current.openDialog();
  };

  const handleClickSelectSituation = (situation: number | null) => {
    setSelectedSituation(situation);
  };

  const filteredProjects = projects.filter(
    (project) => selectedSituation === null || project.situation === selectedSituation
  );

  return (
    <PainelContainer>
      <TitleContainer title="Gerenciar Projetos" />

      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="py-2 px-6 text-lg font-medium rounded-md text-white bg-purple-500 hover:bg-purple-700 transition-colors"
          onClick={handleClickNewProject}
        >
          Criar Novo
        </button>
      </div>

      <div className="flex flex-wrap border-b mb-4">
        {situations.map((situation) => (
          <div
            key={situation.id}
            className={`cursor-pointer py-2 px-4 text-center ${selectedSituation === situation.id
                ? 'text-purple-700 font-semibold border-b-4 border-purple-400'
                : 'text-gray-600 hover:text-purple-600'
              }`}
            onClick={() => handleClickSelectSituation(situation.id)}
          >
            {situation.name}
          </div>
        ))}
      </div>

      {loadingProjects ? (
        <div className="text-center text-lg text-purple-600 my-20">Carregando seus projetos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 cursor-pointer"
                onClick={(event) => handleClickManageProject(event, project)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-purple-700">{project.name}</h3>
                  <button
                    className="bg-purple-500 text-white rounded-full hover:bg-purple-700 transition-colors p-2"
                    onClick={(event) => handleClickEditProject(event, project)}
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 my-2 line-clamp-2">{project.description}</p>
                <div className="text-sm text-gray-500">Situação: {getProjectSituationDescription(project.situation)}</div>
                <div className="text-sm text-gray-500">Visibilidade: {getProjectVisibilityDescription(project.visibility)}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-lg text-purple-600 col-span-full my-20">Nenhum projeto encontrado</div>
          )}
        </div>
      )}

      <ProjectsForm ref={formDialogRef} callbackSubmit={loadProjects} />
    </PainelContainer>
  );
}

export default ProjectsOwnerList;