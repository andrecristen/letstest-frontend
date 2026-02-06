import React, { useRef, useState, useImperativeHandle } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { createReport } from '../../services/reportService';
import FormDialogBase, { FormDialogBaseRef } from "../../components/FormDialogBase"
import notifyProvider from '../../infra/notifyProvider';
import { ReportData, getReportTypeList } from "../../models/ReportData";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Field, Select, Textarea } from "../../ui";


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
            <Field
                id="type"
                label={t("reports.typeLabel")}
                error={errors.type?.message as string | undefined}
            >
                <Select
                    id="type"
                    {...register('type', {
                        setValueAs: (value) => parseInt(value),
                        required: t("reports.typeRequired")
                    })}
                    hasError={Boolean(errors.type)}
                >
                    {reportTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </Select>
            </Field>
            <Field
                id="score"
                label={t("reports.scoreLabel")}
                error={errors.score?.message as string | undefined}
            >
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <FiStar
                            key={i + 1}
                            size={36}
                            className={`cursor-pointer transition-colors ${i < rating ? 'text-citron' : 'text-ink/20'}`}
                            onClick={() => handleRating(i + 1)}
                        />
                    ))}
                </div>
                <input
                    type="hidden"
                    {...register('score', { setValueAs: (value) => parseInt(value), required: t("reports.scoreRequired") })}
                    value={rating}
                />
            </Field>
            <Field
                id="commentary"
                label={t("reports.commentLabel")}
                error={errors.commentary?.message as string | undefined}
            >
                <Textarea
                    id="commentary"
                    {...register('commentary', { required: t("reports.commentRequired") })}
                    hasError={Boolean(errors.commentary)}
                />
            </Field>
        </FormDialogBase>
    )
});

export default ReportForm;
