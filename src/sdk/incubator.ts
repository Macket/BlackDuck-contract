import { invokeScript } from '@waves/waves-transactions';
import { broadcastTx } from './utils';
import { getRarity } from "./rarity";
import { MAKER_SEED, INCUBATOR_ADDRESS, EGG_ID } from "../settings";

const startDuckHatchingTx = () => invokeScript({
    dApp: INCUBATOR_ADDRESS,
    fee: 500000,
    call: {
        function: "startDuckHatching"
    },
    payment: [{
        assetId: EGG_ID,
        amount: 1000
    }],
    chainId: 'T',
}, MAKER_SEED);

const finishDuckHatchingTx = (txId) => invokeScript({
    dApp: INCUBATOR_ADDRESS,
    fee: 500000,
    call: {
        function: "finishDuckHatching",
        args: [{
            type: 'string',
            value: txId
        }]
    },
    chainId: 'T',
}, MAKER_SEED);

export const hatch = async () => {
    let rarity = 100;
    while (rarity > 27) {
        const txId: string = await broadcastTx(startDuckHatchingTx());
        await broadcastTx(finishDuckHatchingTx(txId));
        rarity = await getRarity();
        console.log(rarity);
    }
    // await broadcastTx(finishDuckHatchingTx('DMshChmKk4kAx3283Mf8Zudw9kzo1iATDQE4QfU78DNN'));
}

hatch();
