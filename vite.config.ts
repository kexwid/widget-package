// @ts-nocheck
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), cssInjectedByJsPlugin()],
    resolve: {
        preserveSymlinks: true,
        alias: {
            path: 'path-browserify',
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
            assert: 'assert-browserify',
        },
    },
    optimizeDeps: {
        force: true,

        esbuildOptions: {
            target: ['es2020'],
            define: {
                global: 'globalThis',
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true,
                }),
            ],
        },
    },
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'lib/main.ts'),
            name: 'explorer-widget',
            // the proper extensions will be added
            fileName: 'explorer-widget',
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
            plugins: [
                nodePolyfills({
                    process: true,
                    buffer: true,
                }),
                inject({ Buffer: ['buffer', 'Buffer'] }),
            ],
        },
    },
});
