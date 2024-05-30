import React from 'react';
import TitleContainer from '../base/TitleContainer';
import { InvolvementData } from '../../types/InvolvementData';
import InvolvementPendingItem from './InvolvementPendingItem';

interface InvolvementPendingProps {
    involvements: InvolvementData[];
    title: string;
}

const InvolvementPendingList: React.FC<InvolvementPendingProps> = ({ involvements, title }) => {

    return (
        <div>
            <TitleContainer title={title} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {involvements.length > 0 ? (
                    involvements.map(involvement => (
                        <InvolvementPendingItem involvement={involvement} />
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