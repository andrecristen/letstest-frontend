import React, { useRef, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { getById } from '../../services/testCaseService';
import { create } from '../../services/testExecutionService';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { TestCaseData } from '../../models/TestCaseData';
import { TestExecutionData } from '../../models/TestExecutionData';
import { FiPlusCircle, FiSave } from 'react-icons/fi';
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from '../../components/CustomizableTable/CustomizableTable';
import { Operation } from '../../components/CustomizableTable/CustomizableRow';
import { TemplateData, TemplateTypeEnum } from '../../models/TemplateData';
import { getAllByProjectAndType } from '../../services/templatesService';
import { useNavigate, useParams } from 'react-router-dom';
import Timer from '../../components/Timer';
import LoadingOverlay from '../../components/LoadingOverlay';
import { DeviceData } from '../../models/DeviceData';
import { getDevicesByUserId } from "../../services/deviceService";
import tokenProvider from "../../infra/tokenProvider";

const TestExecutionForm = () => {

    const { projectId, testCaseId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TestCaseData>();
    const customizableTableTestCaseRef = useRef<CustomizableTableRef>(null);
    const customizableTableTestExecutionRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingTestCase, setLoadingTestCase] = useState(false);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [timerFinished, setTimerFinished] = useState<Boolean>(false);
    const [timerTime, setTimerTime] = useState<number>(0);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateDevice = watch('deviceId');

    useEffect(() => {
        load();
    }, []);

    const getProjectId = () => parseInt(projectId ?? '0', 10);
    const getTestCaseId = () => parseInt(testCaseId ?? '0', 10);

    const load = async () => {
        if (getProjectId()) {
            await getTemplates();
        }
        if (getTestCaseId()) {
            await getTestCase();
        }
        await getDevices();
    };

    async function getTemplates() {
        setLoadingTemplates(true);
        const response = await getAllByProjectAndType(
            getProjectId(),
            TemplateTypeEnum["Execução de casos de teste"]
        );
        const newTemplates = response?.data || [];
        setTemplates(newTemplates);
        if (!newTemplates.length) {
            notifyProvider.info("Não há nenhum template para Execução de casos de teste para o seu projeto, certifique-se de criar ao menos.");
        }
        setLoadingTemplates(false);
    }

    async function getTestCase() {
        setLoadingTestCase(true);
        const response = await getById(getTestCaseId());
        setValue('id', response?.data.id);
        setValue('name', response?.data.name);
        const newRows: CustomizableTableRows[] = Object.values(response?.data.data);
        customizableTableTestCaseRef.current?.setRows(newRows);
        setLoadingTestCase(false);
    }

    async function getDevices() {
        setLoadingDevices(true);
        const response = await getDevicesByUserId(tokenProvider.getSessionUserId());
        const devices = response?.data || [];
        setDevices(devices);
        setLoadingDevices(false);
    }

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        let dataSend: TestExecutionData = {
            data: Object.fromEntries(rows.map((item) => [item.id, item])),
            testTime: timerTime,
            deviceId: data.deviceId
        };
        const response = await create(getTestCaseId(), dataSend);
        if (response?.status === 200 || response?.status === 201) {
            notifyProvider.success("Execução reportada com sucesso.");
            navigate(-1);
        } else {
            notifyProvider.error("Erro ao reportar execução, tente novamente.");
        }
    };

    const handleChangeTemplate = () => {
        const template = templates.find(
            (item) => item.id === getValues('templateId')
        );
        customizableTableTestExecutionRef.current?.setRows(template ? Object.values(template.data) : []);
    };

    const handleClickNewDevice = () => {
        navigate("/devices");
    }

    return (
        <PainelContainer>
            <TitleContainer title="Testar Caso de Teste" />
            <LoadingOverlay show={loadingTemplates || loadingTestCase || loadingDevices} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Caso de Teste</label>
                    <input
                        type="text"
                        id="name"
                        disabled
                        {...register('name', { required: 'Caso de teste é obrigatório' })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">Definição do Caso de Teste:</legend>
                        <CustomizableTable
                            ref={customizableTableTestCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
                <div>
                    <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">Dispositivo de execução<button className="p-2 mt-2 text-lg" onClick={handleClickNewDevice} type="button"><FiPlusCircle /></button></label>
                    <select
                        id="deviceId"
                        required
                        {...register('deviceId', {
                            setValueAs: (value) => parseInt(value),
                            required: 'Dispositivo é obrigatório',
                        })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.deviceId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">Selecione o dispositivo</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.model}
                            </option>
                        ))}
                    </select>
                    {errors.deviceId && <span className="text-red-500 text-sm">{errors.deviceId.message}</span>}
                </div>
                {updateDevice ?
                    (
                        <>
                            <Timer
                                title="Executar caso de teste"
                                disabled={!updateDevice}
                                onChange={(value) => { setTimerTime(value) }}
                                onStart={() => { setTimerFinished(false) }}
                                onReset={() => { setTimerFinished(false) }}
                                onStop={() => { setTimerFinished(true); setValue("templateId", undefined); handleChangeTemplate(); }}
                            />
                            {timerFinished ? (
                                <>
                                    <div>
                                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">Template</label>
                                        <select
                                            id="templateId"
                                            {...register('templateId', {
                                                setValueAs: (value) => parseInt(value),
                                                required: 'Template é obrigatório',
                                                onChange: handleChangeTemplate,
                                            })}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                                        >
                                            <option value="">Selecione o template</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.templateId && <span className="text-red-500 text-sm">{errors.templateId.message}</span>}
                                    </div>
                                    <div className="py-2">
                                        <fieldset className="border rounded p-4">
                                            <legend className="text-lg font-semibold">Reportar execução do Caso de Teste:</legend>
                                            {!updateTemplate && (
                                                <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                                                    <strong className="font-bold mr-2">Atenção!</strong>
                                                    <span>Selecione o template desejado para preenchimento.</span>
                                                </div>
                                            )}
                                            <CustomizableTable
                                                ref={customizableTableTestExecutionRef}
                                                operation={Operation.FillIn}
                                                onChange={setRows}
                                            />
                                        </fieldset>
                                    </div>
                                    {!loadingTemplates && updateTemplate ? (
                                        <button
                                            type="submit"
                                            className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex justify-center items-center rounded-md"
                                        >
                                            <FiSave className="mr-2" />
                                            Reportar Execução
                                        </button>
                                    ) : null}</>
                            ) : null}
                        </>
                    )
                    :
                    (
                        <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                            <strong className="font-bold mr-2">Atenção!</strong>
                            <span>Selecione o dispositivo de execução.</span>
                        </div>
                    )
                }
            </form>
        </PainelContainer>
    );
};

export default TestExecutionForm;