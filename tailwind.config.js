// tailwind.config.mjs
import daisyui from 'daisyui';
import themes from 'daisyui/src/theming/themes';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './lib/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [daisyui],
    daisyui: {
        themes: [
            {
                light: {
                    ...themes['[data-theme=light]'],
                    primary: '#666cff',
                },
            },
            {
                dark: {
                    ...themes['[data-theme=dark]'],
                    primary: '#666cff',
                    'base-100': '#2a334c',
                },
            },
        ],
    },
};
