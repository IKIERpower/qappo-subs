// lib/fonts.ts
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
    preload: true,
});

export const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-space-grotesk',
    display: 'swap',
    preload: false, // tylko jeśli używasz jako główny font
});

export const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
    preload: false,
});