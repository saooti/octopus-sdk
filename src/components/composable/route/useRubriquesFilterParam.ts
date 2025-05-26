import { RubriquageFilter } from '@/stores/class/rubrique/rubriquageFilter';
import { useFilterStore } from '../../../stores/FilterStore';
import { useRouteUpdateParams } from './useRouteUpdateParams';

export const useRubriquesFilterParam = ()=>{

  const { updateFiltersParam, updateRouteParamAdvanced } = useRouteUpdateParams();

  const filterStore  = useFilterStore();

  function stringifyRubriquesFilter(filter :Array<RubriquageFilter>|undefined): string{
    if(!filter){
      return "";
    }
    return filter
      .map((value) => value.rubriquageId + ":" + value.rubriqueId)
      .join();
  }
  function returnValToUpdate(modifyFunction: (a: Array<RubriquageFilter>)=> Array<RubriquageFilter>){
    const newFilter = modifyFunction( Array.from(filterStore.filterRubrique));
    const queryString = stringifyRubriquesFilter(newFilter);
    return "" !== queryString ? queryString : undefined;
  }
  function modifyRubriquesFilter(modifyFunction: (a: Array<RubriquageFilter>)=> Array<RubriquageFilter>){
    const valToUpdate = returnValToUpdate(modifyFunction);
    updateFiltersParam({ rubriquesId: valToUpdate }, {r: valToUpdate});
  }

  function returnRubriquesFilter(modifyFunction: (a: Array<RubriquageFilter>)=> Array<RubriquageFilter>){
    const valToUpdate = returnValToUpdate(modifyFunction);
    return { rubriquesId: valToUpdate, r: valToUpdate };
  }

	return {
    stringifyRubriquesFilter,
    modifyRubriquesFilter,
    updateRouteParamAdvanced,
    returnRubriquesFilter
	}
}