import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

export default getRequestConfig(async () => {
    // Try to get locale from cookie first
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;

    // Fallback to Accept-Language header
    let locale: Locale = defaultLocale;

    if (localeCookie && locales.includes(localeCookie)) {
        locale = localeCookie;
    } else {
        const headersList = await headers();
        const acceptLanguage = headersList.get('Accept-Language');
        if (acceptLanguage?.includes('en')) {
            locale = 'en';
        }
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
