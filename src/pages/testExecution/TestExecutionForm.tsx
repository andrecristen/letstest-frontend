import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { finishAssignment, getById } from '../../services/testCaseService';
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
import LoadingOverlay from '../../components/LoadingOverlay';
import { DeviceData } from '../../models/DeviceData';
import { getDevicesByUserId } from "../../services/deviceService";
import tokenProvider from "../../infra/tokenProvider";
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../../ui/utils';

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
    const [timerTime, setTimerTime] = useState<number>(0);
    const [executionTimeText, setExecutionTimeText] = useState<string>("0");
    const [executionTimeError, setExecutionTimeError] = useState<string | null>(null);
    const lastLoadedTestCaseIdRef = useRef<number | null>(null);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateDevice = watch('deviceId');

    const getProjectId = useCallback(() => parseInt(projectId ?? '0', 10), [projectId]);
    const getTestCaseId = useCallback(() => parseInt(testCaseId ?? '0', 10), [testCaseId]);

    const getTemplates = useCallback(async () => {
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
    }, [getProjectId, t]);

    const getTestCase = useCallback(async () => {
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
        const userId = tokenProvider.getSessionUserId();
        const assignment = response?.data.assignments?.find((item: any) => item.userId === userId);
        if (assignment?.startedAt) {
            const startedAt = new Date(assignment.startedAt);
            const totalPausedSeconds = assignment.totalPausedSeconds ?? 0;
            const end = assignment.finishedAt
                ? new Date(assignment.finishedAt)
                : assignment.lastPausedAt
                    ? new Date(assignment.lastPausedAt)
                    : new Date();
            const elapsedSeconds = Math.max(0, Math.floor((end.getTime() - startedAt.getTime()) / 1000) - totalPausedSeconds);
            setTimerTime(elapsedSeconds);
            const totalMinutes = Math.max(0, Math.round(elapsedSeconds / 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            setExecutionTimeText(hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}` : `${minutes}`);
        }
        setLoadingTestCase(false);
    }, [getTestCaseId, setValue]);

    const getDevices = useCallback(async () => {
        setLoadingDevices(true);
        const response = await getDevicesByUserId(tokenProvider.getSessionUserId(), 1, 200);
        const devices = response?.data?.data || [];
        setDevices(devices);
        setLoadingDevices(false);
    }, []);

    const load = useCallback(async () => {
        if (getProjectId()) {
            await getTemplates();
        }
        const currentTestCaseId = getTestCaseId();
        if (currentTestCaseId && lastLoadedTestCaseIdRef.current !== currentTestCaseId) {
            lastLoadedTestCaseIdRef.current = currentTestCaseId;
            await getTestCase();
        }
        await getDevices();
    }, [getProjectId, getTestCaseId, getTemplates, getTestCase, getDevices]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        let dataSend: TestExecutionData = {
            data: Object.fromEntries(rows.map((item) => [item.id, item])),
            testTime: timerTime,
            deviceId: data.deviceId
        };
        const response = await create(getTestCaseId(), dataSend);
        if (response?.status === 200 || response?.status === 201) {
            await finishAssignment(getTestCaseId());
            notifyProvider.success(t("testExecution.reportSuccess"));
            if (projectId) {
                navigate(`/project/test/${projectId}`);
            } else {
                navigate(-1);
            }
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

    const parseExecutionTime = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return { seconds: 0, error: null };
        if (trimmed.includes(":")) {
            const [hoursRaw, minutesRaw] = trimmed.split(":");
            const hours = Number(hoursRaw);
            const minutes = Number(minutesRaw);
            if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59 || hours < 0) {
                return { seconds: 0, error: t("testExecution.executionTimeInvalid") };
            }
            return { seconds: (hours * 60 + minutes) * 60, error: null };
        }
        const minutes = Number(trimmed);
        if (!Number.isFinite(minutes) || minutes < 0) {
            return { seconds: 0, error: t("testExecution.executionTimeInvalid") };
        }
        return { seconds: minutes * 60, error: null };
    };

    const handleExecutionTimeChange = (value: string) => {
        setExecutionTimeText(value);
        const parsed = parseExecutionTime(value);
        setExecutionTimeError(parsed.error);
        if (!parsed.error) {
            setTimerTime(parsed.seconds);
        }
    };

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
                            <div>
                                <label htmlFor="testTime" className="block text-sm font-medium text-gray-700">
                                    {t("testExecution.executionTimeLabel")}
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        id="testTime"
                                        type="text"
                                        inputMode="numeric"
                                        value={executionTimeText}
                                        onChange={(event) => handleExecutionTimeChange(event.target.value)}
                                        placeholder={t("testExecution.executionTimePlaceholder")}
                                        className={`mt-1 block w-full px-3 py-2 border ${executionTimeError ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                                    />
                                    <span className="text-sm text-gray-500">
                                        {t("testExecution.executionTimeHint", { time: formatDuration(timerTime) })}
                                    </span>
                                </div>
                                {executionTimeError ? (
                                    <p className="text-sm text-red-600">{executionTimeError}</p>
                                ) : (
                                    <p className="text-xs text-gray-500">{t("testExecution.executionTimeFormatHint")}</p>
                                )}
                            </div>
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
