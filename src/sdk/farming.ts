import { invokeScript } from '@waves/waves-transactions';
import { broadcastTx } from './utils';
import {TAKER_SEED, FARMING_ADDRESS, EGG_ID, TAKER_BEST_DUCK} from "../settings";

const buyPerchTx = (color: string, referrer: string) => invokeScript({
    dApp: FARMING_ADDRESS,
    call: {
        function: "buyPerch",
        args:[
            { type: "string", value: color }
        ]
    },
    fee: 500000,
    payment: [
        {amount: 100, assetId: EGG_ID}
    ],
    chainId: 'T',
}, TAKER_SEED);

const stakeNFTTx = (duckId: string) => invokeScript({
    dApp: FARMING_ADDRESS,
    call: {
        function: "stakeNFT",
        args:[]
    },
    fee: 500000,
    payment: [
        {amount: 1, assetId: duckId}
    ],
    chainId: 'T',
}, TAKER_SEED);

const unstakeNFTTx = (duckId: string) => invokeScript({
    dApp: FARMING_ADDRESS,
    call: {
        function: "unstakeNFT",
        args:[
            { type: "string", value: duckId },
        ]
    },
    fee: 500000,
    chainId: 'T',
}, TAKER_SEED);

export const buyPerch = async () => {
    try {
        const txId: string = await broadcastTx(buyPerchTx("B", ""));
        console.log(txId);
    } catch (err) {
        console.log(err.message);
    }
}

export const stakeNFT = async () => {
    try {
        const txId: string = await broadcastTx(stakeNFTTx(TAKER_BEST_DUCK));
        console.log(txId);
    } catch (err) {
        console.log(err.message);
    }
}

export const unstakeNFT = async () => {
    try {
        const txId: string = await broadcastTx(unstakeNFTTx(TAKER_BEST_DUCK));
        console.log(txId);
    } catch (err) {
        console.log(err.message);
    }
}

stakeNFT();
