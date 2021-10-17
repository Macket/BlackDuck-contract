import { invokeScript } from '@waves/waves-transactions';
import { broadcastTx } from '../utils';
import { getRarity } from "./rarity";
import { MAKER_SEED, INCUBATOR_ADDRESS, EGG_ID } from "../../settings";

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
        const tx = startDuckHatchingTx();
        await broadcastTx(startDuckHatchingTx());
        await broadcastTx(finishDuckHatchingTx(tx.id));
        rarity = await getRarity();
        console.log(rarity);
    }
}
