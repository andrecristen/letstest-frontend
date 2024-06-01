import React from 'react';
import TitleContainer from '../../components/TitleContainer';
import { InvolvementData, InvolvementSituationEnum } from '../../models/InvolvementData';
import InvolvementPendingItem from './InvolvementPendingItem';

interface InvolvementPendingProps {
    involvements: InvolvementData[];
    typeSituation: InvolvementSituationEnum;
    callback: () => void;
    title: string;
    textHelp?: string;
}

const InvolvementPendingList: React.FC<InvolvementPendingProps> = ({ involvements, typeSituation, callback, title, textHelp }) => {

    return (
        <div>
            <TitleContainer title={title} textHelp={textHelp} />
            <div className="grid grid-cols-1 gap-6 mt-4 p-6">
                {involvements.length > 0 ? (
                    involvements.map(involvement => (
                        <InvolvementPendingItem key={involvement.id} callback={callback} typeSituation={typeSituation} involvement={involvement} />
                    ))
                ) : (
                    <div className="text-center text-purple-600 col-span-full">
                        Nenhum envolvimento encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvolvementPendingList;