import BigNumber from 'bignumber.js';
import { getKDenoms } from './http';
import { Coin, CoinMetadata, KMetadata } from './type';

export class TokenUnitConverter {
    metadata: Record<string, CoinMetadata>;
    constructor(metas?: Record<string, CoinMetadata>) {
        this.metadata = metas ? metas : {};
    }
    addMetadata(denom: string, meta: CoinMetadata) {
        this.metadata[denom] = meta;
    }

    getMetadata = () => {
        return getKDenoms().then((r: any) => r);
    };

    displayKUnits(token: Coin, metadata: KMetadata[]) {
        if (Number(token?.amount)) {
            const unit = metadata.filter(
                (d: any) => token.denom === d.unit_name
            )[0];

            const amount = BigNumber(Number(token.amount)).div(
                BigNumber(10).pow(unit.exponent)
            );
            return {
                amount: amount?.toFixed(2),
                denom: unit?.short_name,
            };
        }

        return {
            amount: '0',
            denom: token?.denom,
        };
    }

    baseKUnits(denom: string, amount: string, metadata: KMetadata[]) {
        const unit = metadata.filter((d: any) => denom === d.short_name)[0];

        if (Number(amount)) {
            const macro = BigNumber(Number(amount)).times(
                BigNumber(10).pow(unit.exponent)
            );

            return {
                amount: Number(macro),
                denom: unit?.unit_name,
            };
        }

        return {
            amount: '0',
            denom: unit?.unit_name || '-',
        };
    }

    baseToDisplay(token: Coin, decimal = 6) {
        const meta = this.metadata[token.denom];
        if (!meta) return token;
        const unit = meta.denom_units.find(
            (unit) => unit.denom === meta.display
        );
        if (!unit) return token;
        const amount = BigNumber(Number(token.amount)).div(
            BigNumber(10).pow(unit.exponent)
        );
        return {
            amount: amount.toFixed(decimal),
            denom: unit.denom.toUpperCase(),
        };
    }
    baseToUnit(token: Coin, unitName: string, decimal = 6) {
        const meta = this.metadata[token.denom];
        if (!meta) return token;
        const unit = meta.denom_units.find((unit) => unit.denom === unitName);
        if (!unit) return token;
        const amount = BigNumber(Number(token.amount)).div(
            BigNumber(10).pow(unit.exponent)
        );
        return {
            amount: parseFloat(amount.toFixed(decimal)).toString(),
            denom: unit.denom,
        };
    }
    displayToBase(baseDenom: string, display: Coin) {
        const meta = this.metadata[baseDenom];
        if (!meta) return display;
        const unit = meta.denom_units.find(
            (unit) => unit.denom === display.denom
        );
        if (!unit) return display;
        const amount = BigNumber(Number(display.amount)).times(
            BigNumber(10).pow(unit.exponent)
        );
        return {
            amount: amount.toFixed(),
            denom: baseDenom,
        };
    }
}
