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
import { useTranslation } from 'react-i18next';

const TestExecutionForm = () => {

    const { t } = useTranslation();
    const { projectId, testCaseId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TestCaseData>();
    const customizableTableScenarioCaseRef = useRef<CustomizableTableRef>(null);
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
            TemplateTypeEnum.TestCaseExecution,
            1,
            200
        );
        const newTemplates = response?.data?.data || [];
        setTemplates(newTemplates);
        if (!newTemplates.length) {
            notifyProvider.info(t("testExecution.noTemplatesInfo"));
        }
        setLoadingTemplates(false);
    }

    async function getTestCase() {
        setLoadingTestCase(true);
        const response = await getById(getTestCaseId());
        setValue('id', response?.data.id);
        setValue('name', response?.data.name);
        const newRowsTestCase: CustomizableTableRows[] = Object.values(response?.data.data);
        customizableTableTestCaseRef.current?.setRows(newRowsTestCase);
        if (response?.data.testScenario?.data) {
            const newRowsTestScenario: CustomizableTableRows[] = Object.values(response?.data.testScenario?.data);
            customizableTableScenarioCaseRef.current?.setRows(newRowsTestScenario);
        }
        setLoadingTestCase(false);
    }

    async function getDevices() {
        setLoadingDevices(true);
        const response = await getDevicesByUserId(tokenProvider.getSessionUserId(), 1, 200);
        const devices = response?.data?.data || [];
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
            notifyProvider.success(t("testExecution.reportSuccess"));
            navigate(-1);
        } else {
            notifyProvider.error(t("testExecution.reportError"));
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
            <TitleContainer title={t("testExecution.pageTitle")} />
            <LoadingOverlay show={loadingTemplates || loadingTestCase || loadingDevices} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t("common.testCaseLabel")}</label>
                    <input
                        type="text"
                        id="name"
                        disabled
                        {...register('name', { required: t("testExecution.testCaseRequired") })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testScenario.definitionLegend")}</legend>
                        <CustomizableTable
                            ref={customizableTableScenarioCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testCase.definitionLegend")}</legend>
                        <CustomizableTable
                            ref={customizableTableTestCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
                <div>
                    <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">{t("common.executionDeviceLabel")} <button className="text-lg" onClick={handleClickNewDevice} type="button"><FiPlusCircle /></button></label>
                    <select
                        id="deviceId"
                        required
                        {...register('deviceId', {
                            setValueAs: (value) => parseInt(value),
                            required: t("testExecution.deviceRequired"),
                        })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.deviceId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">{t("common.selectDevice")}</option>
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
                                title={t("testExecution.executeTitle")}
                                disabled={!updateDevice}
                                onChange={(value) => { setTimerTime(value) }}
                                onStart={() => { setTimerFinished(false) }}
                                onReset={() => { setTimerFinished(false) }}
                                onStop={() => { setTimerFinished(true); setValue("templateId", undefined); handleChangeTemplate(); }}
                            />
                            {timerFinished ? (
                                <>
                                    <div>
                                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">{t("common.templateLabel")}</label>
                                        <select
                                            id="templateId"
                                            {...register('templateId', {
                                                setValueAs: (value) => parseInt(value),
                                                required: t("testExecution.templateRequired"),
                                                onChange: handleChangeTemplate,
                                            })}
                                            className={`mt-1 block w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                                        >
                                            <option value="">{t("common.selectTemplate")}</option>
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
                                            <legend className="text-lg font-semibold">{t("testExecution.reportLegend")}</legend>
                                            {!updateTemplate && (
                                                <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                                                    <strong className="font-bold mr-2">{t("common.attention")}</strong>
                                                    <span>{t("common.selectTemplateWarning")}</span>
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
                                            {t("testExecution.reportButton")}
                                        </button>
                                    ) : null}</>
                            ) : null}
                        </>
                    )
                    :
                    (
                        <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                            <strong className="font-bold mr-2">{t("common.attention")}</strong>
                            <span>{t("common.selectDeviceWarning")}</span>
                        </div>
                    )
                }
            </form>
        </PainelContainer>
    );
};

export default TestExecutionForm;
