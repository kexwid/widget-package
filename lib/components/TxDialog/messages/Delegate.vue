<script lang="ts" setup>
import { ComputedRef, PropType, computed, ref } from 'vue';
import { TokenUnitConverter } from '../../../utils/TokenUnitConverter';
import { decimal2percent } from '../../../utils/format';
import {
    getActiveValidators,
    getInactiveValidators,
    getStakingParam,
} from '../../../utils/http';
import { Coin, CoinMetadata } from '../../../utils/type';

const props = defineProps({
    endpoint: { type: String, required: true },
    sender: { type: String, required: true },
    balances: Object as PropType<Coin[]>,
    metadata: Object as PropType<Record<string, CoinMetadata>>,
    kmetadata: [] as any,
    selectedvalidator: Object as any,
    params: String,
});
const params = computed(() => JSON.parse(props.params || '{}'));

const validator = ref({
    operator_address: '',
    description: { moniker: '' },
    commission: { commission_rates: { rate: '' } },
    status: '',
});

const activeValidators = ref([] as any);
const inactiveValidators = ref([] as any);
const stakingDenom = ref('');
const unbondingTime = ref('');
const amount = ref('');
const amountDenom = ref('');
const denom = ref('');
const emit = defineEmits(['get-validator']);
const showInactiveValidators = ref(false);

const msgs = computed(() => {
    const convert = new TokenUnitConverter(props.metadata);

    return [
        {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: {
                delegatorAddress: props.sender,
                validatorAddress: validator.value.operator_address,
                amount: convert.baseKUnits(
                    denom.value,
                    amount.value,
                    props.kmetadata
                ),
            },
        },
    ];
});

const list: ComputedRef<
    {
        operator_address: string;
        description: { moniker: string };
        commission: { commission_rates: { rate: string } };
        status: string;
    }[]
> = computed(() => {
    return [...activeValidators.value, ...inactiveValidators.value];
});

const available = computed(() => {
    if (!activeValidators.value?.length) initial();

    const unit = props?.kmetadata?.filter(
        (u: any) => u.unit_name == stakingDenom.value
    )[0];

    const convert = new TokenUnitConverter(props.metadata);
    const base = props.balances?.find((x) => x.denom === unit?.unit_name) || {
        amount: '0',
        denom: stakingDenom.value,
    };

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

function loadInactiveValidators() {
    getInactiveValidators(props.endpoint).then((x) => {
        showInactiveValidators.value = true;
        inactiveValidators.value = x.validators;
    });
}

const units = computed(() => {
    const unit = props?.kmetadata?.filter(
        (u: any) => u.unit_name == stakingDenom.value
    )[0];

    if (!props.metadata || !props.metadata[stakingDenom.value]) {
        amountDenom.value = stakingDenom.value;
        denom.value = unit?.short_name;
        return [
            {
                denom: stakingDenom.value,
                short_name: unit?.short_name,
                exponent: 0,
                aliases: [],
            },
        ];
    }
    const list = props.metadata[stakingDenom.value].denom_units.sort(
        (a, b) => b.exponent - a.exponent
    );
    if (list.length > 0) {
        amountDenom.value = list[0].denom;
    }
    return list as any;
});

const isValid = computed(() => {
    let ok = true;
    let error = '';
    if (!validator.value.operator_address) {
        ok = false;
        error = 'Validator is empty';
    }
    if (!(Number(amount.value) > 0)) {
        ok = false;
        error = 'Amount should be great than 0';
    }
    if (!amountDenom.value) {
        ok = false;
        error = 'Amount Denom is empty';
    }
    return { ok, error };
});

const loadValidators = () => {
    getActiveValidators(props.endpoint).then((x) => {
        activeValidators.value = x.validators;
        showInactiveValidators.value = false;
        if (!params.value.validator_address) {
            validator.value = {
                operator_address: '',
                description: { moniker: '' },
                commission: { commission_rates: { rate: '' } },
                status: '',
            };
        } else {
            let selectedValidator = x.validators.filter(
                (v: any) => v.operator_address == params.value.validator_address
            )[0];
            if (selectedValidator) {
                validator.value = selectedValidator;
                emit('get-validator', selectedValidator);
            } else {
                validator.value = {
                    operator_address: '',
                    description: { moniker: '' },
                    commission: { commission_rates: { rate: '' } },
                    status: '',
                };
            }
        }
    });
};

function initial() {
    activeValidators.value = [];

    validator.value = {
        operator_address: params.value.validator_address,
        description: { moniker: '' },
        commission: { commission_rates: { rate: '' } },
        status: '',
    };

    getStakingParam(props.endpoint).then((x) => {
        stakingDenom.value = x.params.bond_denom;
        unbondingTime.value = x.params.unbonding_time;
    });

    loadValidators();
}

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
            <label class="label" v-if="!showInactiveValidators">
                <span class="label-text">Validator</span>
                <a class="label-text" @click="loadInactiveValidators()"
                    >Show Inactive</a
                >
            </label>
            <label class="label" v-if="showInactiveValidators">
                <span class="label-text">Validator</span>
                <a class="label-text" @click="loadValidators()">Show Active</a>
            </label>
            <select
                v-model="validator"
                class="select select-bordered dark:text-white"
                @change="$emit('get-validator', validator)"
            >
                <option disabled selected>Select a validator</option>
                <option
                    v-if="!showInactiveValidators"
                    v-for="v in activeValidators"
                    :value="v"
                >
                    {{ v.description.moniker }} ({{
                        decimal2percent(v.commission.commission_rates.rate)
                    }}%)
                    <span v-if="v.status !== 'BOND_STATUS_BONDED'">x</span>
                </option>

                <option
                    v-if="showInactiveValidators"
                    v-for="v in inactiveValidators"
                    :value="v"
                >
                    {{ v.description.moniker }} ({{
                        decimal2percent(v.commission.commission_rates.rate)
                    }}%)
                    <span v-if="v.status !== 'BOND_STATUS_BONDED'">x</span>
                </option>
            </select>
        </div>
        <div class="form-control">
            <label class="label">
                <span class="label-text">Amount</span>
                <span>
                    {{ available?.display.amount }}
                    {{ available?.display.denom }}
                </span>
            </label>
            <label class="join">
                <input
                    v-model="amount"
                    type="number"
                    :placeholder="`Available: ${available?.display.amount}`"
                    class="input border border-gray-300 dark:border-gray-600 w-full join-item dark:text-white"
                />
                <select
                    v-model="denom"
                    class="select select-bordered join-item dark:text-white"
                >
                    <option v-for="u in units">{{ u.short_name }}</option>
                </select>
            </label>
        </div>
    </div>
</template>
