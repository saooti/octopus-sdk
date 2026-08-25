import { Rubriquage, RubriquageMode } from "@/stores/class/rubrique/rubriquage";

export function isRubriquageMandatory(rubriquage: Rubriquage): boolean {
    return [RubriquageMode.RESTRICTIVE, RubriquageMode.MANDATORY].includes(rubriquage.mode);
}

