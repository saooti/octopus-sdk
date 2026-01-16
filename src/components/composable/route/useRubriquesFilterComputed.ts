import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { useFilterStore } from '../../../stores/FilterStore';
import { computed } from 'vue';

export const useRubriquesFilterComputed = ()=>{

  const filterStore  = useFilterStore();

  const rubriqueQueryParam = computed(() => { 
    if (filterStore.filterRubrique?.length) {
      return filterStore.filterRubrique
        .map(
          (value: RubriquageFilter) =>
            value.rubriquageId + ":" + value.rubriqueId,
        )
        .join();
    }
    return undefined;
  });

  return {
    rubriqueQueryParam
  }
}
