import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import PainelContainer from '../../components/PainelContainer';
import { FiSmartphone, FiSmile } from 'react-icons/fi';
import { UserData } from '../../models/UserData';
import { getMe, update } from '../../services/userService';
import LoadingOverlay from '../../components/LoadingOverlay';
import tokenProvider from '../../infra/tokenProvider';
import notifyProvider from '../../infra/notifyProvider';
import { useNavigate } from 'react-router-dom';
import TitleContainer from '../../components/TitleContainer';
import { Button, Card, Field, Input, Textarea } from '../../ui';
import { useTranslation } from 'react-i18next';

const UserFormProfileEdit = () => {

    const { t } = useTranslation();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserData>();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const onSubmit: SubmitHandler<UserData> = async (data) => {
        const response = await update(tokenProvider.getSessionUserId(), data);
        if (response?.status === 200 || response?.status === 201) {
            notifyProvider.success(t("profile.updateSuccess"));
        } else {
            notifyProvider.error(t("profile.updateError"));
        }
    };

    const load = async () => {
        const response = await getMe();
        setValue('id', response?.data.id);
        setValue('name', response?.data.name);
        setValue('email', response?.data.email);
        setValue('bio', response?.data.bio);
        setLoading(false);
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loading} />
            <div className="space-y-6">
                <TitleContainer title={t("profile.editTitle")} />
                <Card className="space-y-6 p-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <img
                            className="h-32 w-32 rounded-full border border-ink/10 object-cover"
                            src="https://via.placeholder.com/150"
                            alt={t("common.userAvatar")}
                        />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("profile.title")}</p>
                            <h2 className="font-display text-2xl text-ink">{t("profile.yourData")}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => navigate('/habilities')}
                            className="group rounded-2xl border border-ink/10 bg-paper/80 p-4 text-left transition-all hover:-translate-y-1 hover:border-ink/30"
                        >
                            <FiSmile className="text-xl text-ink/60 group-hover:text-ink" />
                            <h3 className="mt-3 font-semibold text-ink">{t("profile.mySkills")}</h3>
                            <p className="text-sm text-ink/50">{t("profile.updateSkills")}</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/devices')}
                            className="group rounded-2xl border border-ink/10 bg-paper/80 p-4 text-left transition-all hover:-translate-y-1 hover:border-ink/30"
                        >
                            <FiSmartphone className="text-xl text-ink/60 group-hover:text-ink" />
                            <h3 className="mt-3 font-semibold text-ink">{t("profile.myDevices")}</h3>
                            <p className="text-sm text-ink/50">{t("profile.manageExecutionEnvironments")}</p>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
                            <Input
                                type="text"
                                id="name"
                                {...register('name', { required: t("common.nameRequired") })}
                            />
                        </Field>
                        <Field label={t("common.emailLabel")} error={errors.email?.message as string | undefined}>
                            <Input
                                type="email"
                                id="email"
                                disabled
                                {...register('email', { required: t("common.emailRequired") })}
                            />
                        </Field>
                        <Field label={t("common.bioLabel")} error={errors.bio?.message as string | undefined}>
                            <Textarea
                                id="bio"
                                {...register('bio')}
                            />
                        </Field>
                        <Button type="submit" variant="accent" size="lg" className="w-full">
                            {t("common.save")}
                        </Button>
                    </form>
                </Card>
            </div>
        </PainelContainer>
    );
};

export default UserFormProfileEdit;
