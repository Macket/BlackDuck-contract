import { IInvokeScriptParams } from "@waves/waves-transactions";
import { EGG_ID, GAME_ADDRESS, CHAIN_ID } from "../../settings";
import { generateCommit, DUCKS_ORDER_TYPE } from "../utils"

export const makeGameTx = (
    slot: number,
    rarityRangeWorst: number,
    rarityRangeMedium: number,
    rarityRangeBest: number,
    eggs: number,
): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "makeGame",
        args: [
            { type: 'integer', value: slot },
            { type: 'integer', value: rarityRangeWorst },
            { type: 'integer', value: rarityRangeMedium },
            { type: 'integer', value: rarityRangeBest },
        ],
    },
    payment: [{
        assetId: EGG_ID,
        amount: eggs,
    }],
    chainId: CHAIN_ID,
});

export const kickGameTx = (slot: number): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "kickGame",
        args: [
            { type: 'integer', value: slot },
        ],
    },
    chainId: CHAIN_ID,
});

export const takeGameTx = (slot: number, eggs: number): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "takeGame",
        args: [
            { type: 'integer', value: slot },
        ],
    },
    payment: [{
        assetId: EGG_ID,
        amount: eggs,
    }],
    chainId: CHAIN_ID,
});

export const pickDucksTx = (worstDuckId: string, mediumDuckId: string, bestDuckId: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "pickDucks",
        args: [
            { type: "string", value: worstDuckId },
            { type: "string", value: mediumDuckId },
            { type: "string", value: bestDuckId },
        ]
    },
    chainId: CHAIN_ID,
});

export const wrongPickDucksTx = (worstDuckId: string, mediumDuckId: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "pickDucks",
        args: [
            { type: "string", value: worstDuckId },
            { type: "string", value: mediumDuckId },
        ]
    },
    chainId: CHAIN_ID,
});

export const commitTx = (duckOrder: DUCKS_ORDER_TYPE, salt: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "commit",
        args: [
            { type: "string", value: generateCommit(duckOrder, salt) },
        ]
    },
    chainId: CHAIN_ID,
});

export const revealTx = (duckOrder: DUCKS_ORDER_TYPE, salt: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "reveal",
        args: [
            { type: "string", value: duckOrder },
            { type: "string", value: salt },
        ]
    },
    chainId: CHAIN_ID,
});

export const getPrizeTx = (): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "getPrize",
    },
    chainId: CHAIN_ID,
});
