import React from "react";
import { FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { InvolvementData } from "../../types/InvolvementData";

interface InvolvementPendingItemProps {
    involvement: InvolvementData;
}

const InvolvementPendingItem: React.FC<InvolvementPendingItemProps> = ({ involvement }) => {

    const navigate = useNavigate();

    const handleClickProfileUser = () => {
        navigate("/profile/" + involvement.user?.id);
    }

    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiStar className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {involvement.id}</p>
                </div>
            </div>
        </div>
    );
};

export default InvolvementPendingItem;