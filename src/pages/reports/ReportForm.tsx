import React, { useRef, useState, useImperativeHandle } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { createReport } from '../../services/reportService';
import FormDialogBase, { FormDialogBaseRef } from "../../components/FormDialogBase"
import notifyProvider from '../../infra/notifyProvider';
import { ReportData, getReportTypeList } from "../../models/ReportData";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";


const ReportForm = React.forwardRef<any, any>((props, ref) => {

    const { t } = useTranslation();
    const formDialogRef = useRef<FormDialogBaseRef>(null);
    const { register, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm<ReportData>();
    const [rating, setRating] = useState<number>(watch('score') || 0);

    const handleRating = (rate: number) => {
        setRating(rate);
        setValue('score', rate);
    };

    const reportTypes = getReportTypeList();

    useImperativeHandle(ref, () => ({
        openDialog: () => formDialogRef.current?.openDialog(),
        closeDialog: () => formDialogRef.current?.closeDialog(),
    }));

    const onSubmit: SubmitHandler<ReportData> = async (data) => {
        const response = await createReport(props.testExecution?.id, data);
        if (response?.status === 201) {
            notifyProvider.success(t("reports.createSuccess"));
        } else {
            notifyProvider.error(t("reports.createError"));
        }
        handleRating(0);
        reset();
        formDialogRef.current?.closeDialog();
        if (props.callbackSubmit) {
            props.callbackSubmit();
        }
    }

    const handleCancel = () => {
        handleRating(0);
        reset();
    }

    return (
        <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} cancel={handleCancel} title={t("reports.rateTitle")}>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">{t("reports.typeLabel")}</label>
                <select
                    id="type"
                    {...register('type', {
                        setValueAs: (value) => parseInt(value),
                        required: t("reports.typeRequired")
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                >
                    {reportTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
            </div>
            <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700">{t("reports.scoreLabel")}</label>
                <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                        <FiStar
                            key={i + 1}
                            size={36}
                            className={`cursor-pointer ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            onClick={() => handleRating(i + 1)}
                        />
                    ))}
                </div>
                {errors.score && <span className="text-red-500 text-sm">{errors.score.message}</span>}
                <input
                    type="hidden"
                    {...register('score', { setValueAs: (value) => parseInt(value), required: t("reports.scoreRequired") })}
                    value={rating}
                />
            </div>
            <div>
                <label htmlFor="commentary" className="block text-sm font-medium text-gray-700">{t("reports.commentLabel")}</label>
                <textarea
                    id="commentary"
                    {...register('commentary', { required: t("reports.commentRequired") })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.commentary ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                />
                {errors.commentary && <span className="text-red-500 text-sm">{errors.commentary.message}</span>}
            </div>
        </FormDialogBase>
    )
});

export default ReportForm;
