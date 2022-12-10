// app/_lib/format.js

import { format } from 'date-fns';
import { enUS, es, ru } from 'date-fns/locale';

const locales = { enUS, es, ru };

// by providing a default string of 'PP' or any of its variants for `formatStr`
// it will format dates in whichever way is appropriate to the locale
export default function (date: Date, formatStr = 'PP') {
    return format(date, formatStr, {
        locale: locales[navigator.language as keyof typeof locales], // or global.__localeId__
    });
}
