import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import PainelContainer from '../../components/PainelContainer';
import { UserData } from '../../models/UserData';
import { getById } from '../../services/userService';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useParams } from 'react-router-dom';
import TitleContainer from '../../components/TitleContainer';
import HabilityList from '../habilities/HabilityList';
import { HabilityData } from '../../models/HabilityData';
import { getHabilitiesByUserId } from '../../services/habilityService';
import { getDevicesByUserId } from '../../services/deviceService';
import DeviceList from '../devices/DeviceList';
import { DeviceData } from '../../models/DeviceData';
import { Card, Field, Input, Textarea } from '../../ui';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';

const UserFormProfileView = () => {

    const { t } = useTranslation();
    const { register, setValue, formState: { errors } } = useForm<UserData>();
    const [loading, setLoading] = useState<boolean>(true);
    const { userId } = useParams();

    const {
        items: habilities,
        loading: loadingHabilities,
        loadingMore: loadingMoreHabilities,
        hasNext: hasNextHabilities,
        sentinelRef: habilitiesRef,
    } = useInfiniteList<HabilityData>(
        async (page, limit) => {
            const response = await getHabilitiesByUserId(parseInt(userId || "0", 10), page, limit);
            return response?.data ?? null;
        },
        [userId],
        { enabled: Boolean(userId) }
    );

    const {
        items: devices,
        loading: loadingDevices,
        loadingMore: loadingMoreDevices,
        hasNext: hasNextDevices,
        sentinelRef: devicesRef,
    } = useInfiniteList<DeviceData>(
        async (page, limit) => {
            const response = await getDevicesByUserId(parseInt(userId || "0", 10), page, limit);
            return response?.data ?? null;
        },
        [userId],
        { enabled: Boolean(userId) }
    );

    const load = useCallback(async () => {
        const responseUser = await getById(parseInt(userId || "0", 10));
        setValue('id', responseUser?.data.id);
        setValue('name', responseUser?.data.name);
        setValue('email', responseUser?.data.email);
        setValue('bio', responseUser?.data.bio);
        setLoading(false);
    }, [setValue, userId]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <PainelContainer>
            <LoadingOverlay show={loading || loadingHabilities || loadingDevices || loadingMoreHabilities || loadingMoreDevices} />
            <div className="space-y-6">
                <TitleContainer title={t("profile.viewTitle")} />
                <Card className="space-y-6 p-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <img
                            className="h-32 w-32 rounded-full border border-ink/10 object-cover"
                            src="https://via.placeholder.com/150"
                            alt={t("common.userAvatar")}
                        />
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("profile.title")}</p>
                            <h2 className="font-display text-2xl text-ink">{t("profile.userInfo")}</h2>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
                            <Input
                                type="text"
                                id="name"
                                disabled
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
                                disabled
                                {...register('bio')}
                            />
                        </Field>
                    </div>
                </Card>
                <HabilityList habilities={habilities} />
                {hasNextHabilities ? <div ref={habilitiesRef} /> : null}
                <DeviceList devices={devices} />
                {hasNextDevices ? <div ref={devicesRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default UserFormProfileView;
