import React, {useCallback, useEffect, useRef, useState} from 'react';
import {getTagById} from "../services/tagService";
import {TagData, TagSituation} from "../models/TagData";
import LoadingOverlay from "./LoadingOverlay";
import {Operation} from "./CustomizableTable/CustomizableRow";
import Tooltip from "./Tooltip";
import {useTranslation} from "react-i18next";
import { Select } from "../ui";

interface TagRenderProps {
    tagId: number;
    tagValueId: number;
    onChange: (tagValueId: number) => void;
    operation: Operation
}

const tagCache = new Map<number, TagData>();
const inFlightRequests = new Map<number, Promise<TagData | undefined>>();

const TagRender: React.FC<TagRenderProps> = ({tagId, tagValueId, onChange, operation}) => {

    const {t} = useTranslation();
    const [tag, setTag] = useState<TagData>();
    const [loadingTag, setLoadingTag] = useState(false);
    const lastFetchedIdRef = useRef<number | null>(null);



    const load = useCallback(async () => {
        if (tagId) {
            if (lastFetchedIdRef.current === tagId) {
                return;
            }
            const cached = tagCache.get(tagId);
            if (cached) {
                setTag(cached);
                lastFetchedIdRef.current = tagId;
                return;
            }
            setLoadingTag(true);
            try {
                let request = inFlightRequests.get(tagId);
                if (!request) {
                    request = getTagById(tagId).then((response) => response?.data);
                    inFlightRequests.set(tagId, request);
                }
                const fetched = await request;
                if (fetched) {
                    tagCache.set(tagId, fetched);
                }
                setTag(fetched);
                lastFetchedIdRef.current = tagId;
            } finally {
                inFlightRequests.delete(tagId);
                setLoadingTag(false);
            }
        } else {
            setTag(undefined);
            lastFetchedIdRef.current = null;
        }
    }, [tagId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleOnchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value, 10);
        onChange(newValue);
    }

    const selectedTagValue = tag?.tagValues?.find((tagValue) => tagValue.id === tagValueId);

    return (
        <div>
            <LoadingOverlay show={loadingTag}/>
            <div className="flex items-center space-x-2">
                {operation === Operation.View ? (
                    <div className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink/70">
                        {selectedTagValue ? selectedTagValue.name : t("customTable.emptyValue")}
                    </div>
                ) : (
                    <Select
                        required={operation === Operation.FillIn}
                        disabled={operation === Operation.Edit}
                        onChange={e => handleOnchange(e)}
                        value={tagValueId}
                    >
                        <option value="">{t("common.selectValue")}</option>
                        <optgroup label={t("tags.activeGroup")}>
                            {tag?.tagValues && tag.tagValues.filter(tagValue => tagValue.situation === TagSituation.Ativo).map((tagValue) => {
                                return (
                                    <option key={"tagValue" + tagValue.id}
                                            value={tagValue.id}>{tagValue.name} {tagValue.commentary ? (" (" + tagValue.commentary + ")") : null}</option>
                                );
                            })}
                        </optgroup>
                        <optgroup label={t("tags.archivedGroup")}>
                            {tag?.tagValues && tag.tagValues.filter(tagValue => tagValue.situation === TagSituation.Arquivado).map((tagValue) => {
                                return (
                                    <option disabled={true} key={"tagValue" + tagValue.id}
                                            value={tagValue.id}>{tagValue.name} {tagValue.commentary ? (" (" + tagValue.commentary + ")") : null}</option>
                                );
                            })}
                        </optgroup>
                    </Select>
                )}
                {tag?.commentary ? (<Tooltip text={tag?.commentary}/>) : null}
            </div>
        </div>
    );
};

export default TagRender;
