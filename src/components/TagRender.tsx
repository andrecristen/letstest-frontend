import React, { useEffect, useState } from 'react';
import { getTagById } from "../services/tagService";
import { TagData } from "../models/TagData";
import LoadingOverlay from "./LoadingOverlay";
import { Operation } from "./CustomizableTable/CustomizableRow";
import { toast } from "react-toastify";
import onChange = toast.onChange;

interface TagRenderProps {
    tagId: number;
    tagValueId: number;
    onChange: (tagValueId: number) => void;
    operation: Operation
}

const TagRender: React.FC<TagRenderProps> = ({ tagId, tagValueId, onChange, operation }) => {

    const [tag, setTag] = useState<TagData>();
    const [loadingTag, setLoadingTag] = useState(false);


    useEffect(() => {
        onChange(tagValueId || 0);
        load();
    }, [tagId]);

    const load = async () => {
        if (tagId) {
            setLoadingTag(true);
            try {
                const response = await getTagById(tagId);
                const tag = response?.data;
                setTag(tag);
            } finally {
                setLoadingTag(false);
            }
        }
    };

    const handleOnchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value);
        onChange(newValue);
        tagValueId = newValue;
    }

    return (
        <div>
            <LoadingOverlay show={loadingTag} />
            <select
                required={operation == Operation.FillIn}
                disabled={operation == Operation.Edit}
                className="form-input"
                onChange={e => handleOnchange(e)}
                value={tagValueId}
            >
                <option value="">Selecione o valor</option>
                {tag?.tagValues && tag.tagValues.map((tagValue) => {
                    return (
                        <option key={"tagValue" + tagValue.id} value={tagValue.id}>{tagValue.name}</option>
                    );
                })}
            </select>
        </div>
    );
};

export default TagRender;