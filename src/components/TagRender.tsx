import React, {useEffect, useState} from 'react';
import {getTagById} from "../services/tagService";
import {TagData, TagSituation} from "../models/TagData";
import LoadingOverlay from "./LoadingOverlay";
import {Operation} from "./CustomizableTable/CustomizableRow";
import {toast} from "react-toastify";
import Tooltip from "./Tooltip";

interface TagRenderProps {
    tagId: number;
    tagValueId: number;
    onChange: (tagValueId: number) => void;
    operation: Operation
}

const TagRender: React.FC<TagRenderProps> = ({tagId, tagValueId, onChange, operation}) => {

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
            <LoadingOverlay show={loadingTag}/>
            <div className="flex items-center space-x-2">
                <select
                    required={operation == Operation.FillIn}
                    disabled={operation == Operation.Edit || operation == Operation.View}
                    className="form-input"
                    onChange={e => handleOnchange(e)}
                    value={tagValueId}
                >
                    <option value="">Selecione o valor</option>
                    <optgroup label="Ativos">
                        {tag?.tagValues && tag.tagValues.filter(tagValue => tagValue.situation == TagSituation.Ativo).map((tagValue) => {
                            return (
                                <option key={"tagValue" + tagValue.id}
                                        value={tagValue.id}>{tagValue.name} {tagValue.commentary ? (" (" + tagValue.commentary + ")") : null}</option>
                            );
                        })}
                    </optgroup>
                    <optgroup label="Arquivados">
                        {tag?.tagValues && tag.tagValues.filter(tagValue => tagValue.situation == TagSituation.Arquivado).map((tagValue) => {
                            return (
                                <option disabled={true} key={"tagValue" + tagValue.id}
                                        value={tagValue.id}>{tagValue.name} {tagValue.commentary ? (" (" + tagValue.commentary + ")") : null}</option>
                            );
                        })}
                    </optgroup>
                </select>
                {tag?.commentary ? (<Tooltip text={tag?.commentary}/>) : null}
            </div>
        </div>
    );
};

export default TagRender;