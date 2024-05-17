import { createApp, h } from 'vue';
import './main.css';
// @ts-ignore
import wrapper from 'vue3-webcomponent-wrapper';

import ConnectWallet from './components/ConnectWallet/index.vue';
import TokenConvert from './components/TokenConvert/index.vue';
import TxDialog from './components/TxDialog/index.vue';

function registry(name: string, module: any) {
    if (!window.customElements.get(name)) {
        const component = wrapper(module, createApp, h);
        window.customElements.define(name, component);
    }
}

registry('explorer-tx-dialog', TxDialog);
registry('explorer-connect-wallet', ConnectWallet);
registry('explorer-token-convert', TokenConvert);

export default {
    version: '0.0.1',
};
