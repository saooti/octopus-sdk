import { Emission } from "@/stores/class/general/emission";
import { state } from "../../stores/ParamSdkStore";
import { useGeneralStore } from "../../stores/GeneralStore";
import { Podcast } from "../../stores/class/general/podcast";

export const usePresentationItemTags = () => {
    const generalStore = useGeneralStore();
    
    function tagsFor(element: Podcast|Emission): Array<string>|undefined {
        const type = state.presentationItems.tags;
        if (type === 'iab') {
            const emission = 'emission' in element ? element.emission : element;
            return generalStore.storedCategories
                .filter(cat => emission.iabIds.includes(cat.id))
                .map(cat => cat.name);
        } else {
            return undefined;
        }
    }

    return { tagsFor };
};
