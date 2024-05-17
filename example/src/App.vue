<script setup lang="ts">
import { ref } from 'vue';

const sender = 'bc1qjdyxk9t90jxmeqpdwkn8cd7nj6cu7x3m688xlj';
const endpoint = 'https://devnet-2-rpc.side.one';
const chainId = 'taproot-1';
const hdPath = "m/44'/118/0'/0/0";

const params = JSON.stringify({
    proposal_id: '1',
    validator_address: 'bc1qjdyxk9t90jxmeqpdwkn8cd7nj6cu7x3m688xlj',
});

const types = [
    'send',
    'delegate',
    'vote',
    'redelegate',
    'unbond',
    'transfer',
    'deposit',
    'withdraw',
    'withdraw_commission',
];
const toOpen = ref('send');
</script>

<template>
    <div>
        Explorer Widget:

        <explorer-connect-wallet :chain-id="chainId" :hd-path="hdPath" />

        <select v-model="toOpen">
            <option v-for="i in types">{{ i }}</option>
        </select>

        <br />

        <label :for="toOpen" class="btn">{{ toOpen }}</label>
        <explorer-tx-dialog
            :type="toOpen"
            :sender="sender"
            :endpoint="endpoint"
            :params="params"
        ></explorer-tx-dialog>

        <br />
        // example:<br />
        <label for="withdraw" class="btn">Withdraw</label>
        <explorer-tx-dialog
            type="withdraw"
            :sender="sender"
            :endpoint="endpoint"
            :params="params"
        ></explorer-tx-dialog>

        <label for="vote" class="btn">Vote</label>
        <explorer-tx-dialog
            type="vote"
            :sender="sender"
            :endpoint="endpoint"
            :params="params"
        ></explorer-tx-dialog>
    </div>
</template>

<style scoped></style>
