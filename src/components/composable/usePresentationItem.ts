import { Emission } from "@/stores/class/general/emission";
import { state } from "../../stores/ParamSdkStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { Podcast } from "../../stores/class/general/podcast";
import { rubriquesApi } from "../../api";
import { useDayjs } from "./useDayjs";

export const usePresentationItem = () => {
    const generalStore = useGeneralStore();
    const { formatDate } = useDayjs();

    function iabTags(emission: Emission): Array<string> {
        return generalStore.storedCategories
            .filter(cat => emission.iabIds.includes(cat.id))
            .map(cat => cat.name);
    }

    async function rubriqueTags(element: Podcast|Emission): Promise<Array<string>> {
        const rubriqueIds: Array<number> = [];
        if (element.rubriqueIds) {
            rubriqueIds.push(...element.rubriqueIds);
        }
        if ('emission' in element && element.emission.rubriqueIds) {
            rubriqueIds.push(...element.emission.rubriqueIds);
        }
        const promises = rubriqueIds.map(rubriquesApi.getCachedRubrique);
        const rubriques = await Promise.all(promises);

        if (state.presentationItems.tagsRubriquageId) {
            const rubriquageId = state.presentationItems.tagsRubriquageId;
            return rubriques.filter(r => r.rubriquageId === rubriquageId).map(r => r.name);
        } else {
            return rubriques.map(r => r.name);
        }
    }
    
    async function tagsFor(element: Podcast|Emission): Promise<Array<string>|undefined> {
        const type = state.presentationItems.tags;
        let tags: Array<string>|undefined = undefined;
        if (type === 'iab') {
            const emission = 'emission' in element ? element.emission : element;
            tags = iabTags(emission);
        } else if (type === 'rubrique') {
            tags = await rubriqueTags(element);
        }

        if (tags && state.presentationItems.tagsLimit) {
            return tags.slice(0, state.presentationItems.tagsLimit);
        }

        return tags;
    }

    function additionalInfoFor(element: Podcast|Emission): Array<string>|undefined {
        const prop = state.presentationItems.additionalInfo;
        if (!prop?.length) {
            return undefined;
        }

        const podcast = 'emission' in element ? element : null;
        const emission = podcast?.emission ?? element as Emission;

        return prop.map(property => {
            if (property === 'date') {
                if (podcast?.pubDate) {
                    return formatDate(podcast.pubDate);
                } else {
                    return null;
                }
            } else if (property === 'productor') {
                return emission.orga.name;
            }
            return null;
        }).filter(p => p !== null);
    }

    return { tagsFor, additionalInfoFor };
};
