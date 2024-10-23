import { Karla } from 'next/font/google';
import { Noto_Sans_Mono } from 'next/font/google';

export const notoSansMono = Noto_Sans_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
});
export const karla = Karla({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
});