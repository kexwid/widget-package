<script lang="ts" setup>
import { PropType, computed, ref } from 'vue';
import { getDelegations } from '../../../utils/http';
import { TokenUnitConverter } from '../../../utils/TokenUnitConverter';
import { Coin, CoinMetadata } from '../../../utils/type';

const props = defineProps({
    endpoint: { type: String, required: true },
    sender: { type: String, required: true },
    metadata: Object as PropType<Record<string, CoinMetadata>>,
    params: String,
    kmetadata: Array as any,
});

const params = computed(() => JSON.parse(props.params || '{}'));
const delegation = ref(
    {} as {
        balance: Coin;
        delegation: {
            delegator_address: string;
            shares: string;
            validator_address: string;
        };
    }
);
const amount = ref('');
const amountDenom = ref('');
const error = ref('');
const denom = ref('');

const msgs = computed(() => {
    const convert = new TokenUnitConverter(props.metadata);

    return [
        {
            typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
            value: {
                delegatorAddress: props.sender,
                validatorAddress: params.value.validator_address,
                amount: convert.baseKUnits(
                    denom.value,
                    amount.value,
                    props.kmetadata
                ),
            },
        },
    ];
});

const units = computed(() => {
    const delegationDenom = delegation.value.balance?.denom;
    const unit = props?.kmetadata?.filter(
        (u: any) => u.unit_name == delegationDenom
    )[0];
    if (!props.metadata || !props.metadata[delegationDenom]) {
        amountDenom.value = delegationDenom;
        denom.value = unit?.short_name;
        return [
            {
                denom: delegationDenom,
                short_name: unit?.short_name,
                exponent: 0,
                aliases: [],
            },
        ];
    }

    const list = props.metadata[delegationDenom].denom_units.sort(
        (a, b) => b.exponent - a.exponent
    );

    if (list.length > 0) amountDenom.value = list[0].denom;
    return list as any;
});

const isValid = computed(() => {
    let ok = true;
    let error = '';
    if (!props.sender) {
        ok = false;
        error = 'Sender is empty';
    }
    if (!params.value.validator_address) {
        ok = false;
        error = 'Validator is empty';
    }
    if (!(Number(amount.value) > 0)) {
        ok = false;
        error = 'Amount should be great than 0';
    }
    return { ok, error };
});

function initial() {
    getDelegations(props.endpoint, params.value.validator_address, props.sender)
        .then((x) => {
            delegation.value = x.delegation_response;
        })
        .catch((err) => {
            error.value = err;
        });
}

const available = computed(() => {
    const convert = new TokenUnitConverter(props.metadata);
    const base = delegation.value?.balance || { amount: '', denom: '' };

    if (!props?.kmetadata?.length) {
        return {
            base,
            display: convert.baseToUnit(base, amountDenom.value),
        };
    }
    return {
        denom,
        display: convert.displayKUnits(base, props.kmetadata),
    };
});

defineExpose({ msgs, isValid, initial });
</script>
<template>
    <div>
        <div class="form-control">
            <label class="label">
                <span class="label-text">Sender</span>
            </label>
            <input
                :value="sender"
                type="text"
                class="text-gray-600 dark:text-white input border !border-gray-300 dark:!border-gray-600"
            />
        </div>
        <div class="form-control">
            <label class="label">
                <span class="label-text">Amount</span>
            </label>
            <label class="input-group">
                <input
                    v-model="amount"
                    type="number"
                    :placeholder="`Avaiable: ${available.display?.amount}`"
                    class="input border border-gray-300 dark:border-gray-600 w-full dark:text-white"
                />
                <select
                    v-model="denom"
                    class="select select-bordered dark:text-white"
                >
                    <option v-for="u in units">{{ u.short_name }}</option>
                </select>
            </label>
        </div>
        <div class="text-error">{{ error }}</div>
    </div>
</template>
