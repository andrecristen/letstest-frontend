import React from 'react';
import { InvolvementData, InvolvementSituationEnum } from '../../models/InvolvementData';
import InvolvementPendingItem from './InvolvementPendingItem';
import { useTranslation } from 'react-i18next';

interface InvolvementPendingProps {
    involvements: InvolvementData[];
    typeSituation: InvolvementSituationEnum;
    callback: () => void;
}

const InvolvementPendingList: React.FC<InvolvementPendingProps> = ({ involvements, typeSituation, callback }) => {

    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            {involvements.length > 0 ? (
                involvements.map(involvement => (
                    <InvolvementPendingItem key={involvement.id} callback={callback} typeSituation={typeSituation} involvement={involvement} />
                ))
            ) : (
                <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                    {t("involvement.emptyList")}
                </div>
            )}
        </div>
    );
};

export default InvolvementPendingList;
