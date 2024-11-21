export const kopiExperimentalSuggestChain = (
    chainId: string,
    chainName: string
) => {
    return {
        chainId: chainId,
        chainName: chainName,
        rpc: 'https://rpc.kopi.money',
        rest: 'https://rest2.kopi.money',
        bip44: {
            coinType: 118, // Cosmos Hub BIP44 coin type, change if necessary
        },
        coinType: 118,
        stakeCurrency: {
            coinDenom: 'XKP',
            coinMinimalDenom: 'ukopi',
            coinDecimals: 6,
        },
        walletUrlForStaking: 'https://wallet.keplr.app',
        bech32Config: {
            bech32PrefixAccAddr: 'kopi',
            bech32PrefixAccPub: 'kopipub',
            bech32PrefixValAddr: 'kopivaloper',
            bech32PrefixValPub: 'kopivaloperpub',
            bech32PrefixConsAddr: 'kopivalcons',
            bech32PrefixConsPub: 'kopivalconspub',
        },
        currencies: [
            {
                coinDenom: 'XKP',
                coinMinimalDenom: 'ukopi',
                coinDecimals: 6, // Number of decimal places for your custom token
            },
        ],
        feeCurrencies: [
            {
                coinDenom: 'XKP',
                coinMinimalDenom: 'ukopi',
                coinDecimals: 6,
                coinGeckoId: chainName,
                gasPriceStep: {
                    low: 0.01,
                    average: 0.025,
                    high: 0.03,
                },
            },
        ],
    };
};
