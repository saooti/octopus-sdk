import dayjs, { Dayjs } from "dayjs";
import { useI18n } from "vue-i18n"

import "dayjs/locale/de";
import "dayjs/locale/es";
import "dayjs/locale/fr";
import "dayjs/locale/it";
import "dayjs/locale/sl";

import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

import { state } from "../../stores/ParamSdkStore";

export const useDayjs = () => {
    const { locale } = useI18n();

    function composableDayjs(param?: string|number|Date|Dayjs): Dayjs {
        return dayjs(param).locale(locale.value);
    }
    composableDayjs.duration = dayjs.duration;

    function formatDate(param: string|number|Date|Dayjs, forceTime?: boolean): string {
        const withTime = forceTime ?? state.generalParameters.showTimeWithDates === true;
        const format = withTime ? 'D MMMM YYYY - HH:mm' : 'D MMMM YYYY';
        return composableDayjs(param).format(format);
    }

    return {
        formatDate,
        dayjs: composableDayjs
    }
}
