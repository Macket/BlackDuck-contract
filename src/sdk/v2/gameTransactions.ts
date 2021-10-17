import { IInvokeScriptParams } from "@waves/waves-transactions";
import { EGG_ID, GAME_ADDRESS, CHAIN_ID } from "../../settings";

export const makeGameTx = (
    slot: number,
    worstRange: number,
    mediumRange: number,
    bestRange: number,
    randomsCommit: string,
    eggs: number,
    assetId = EGG_ID,
): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "makeGame",
        args: [
            { type: 'integer', value: slot },
            { type: 'integer', value: worstRange },
            { type: 'integer', value: mediumRange },
            { type: 'integer', value: bestRange },
            { type: 'string', value: randomsCommit },
        ],
    },
    payment: [{
        assetId: assetId,
        amount: eggs,
    }],
    chainId: CHAIN_ID,
});

export const takeGameTx = (slot: number, randoms: string, skipReplace: boolean, eggs: number, assetId = EGG_ID): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "takeGame",
        args: [
            { type: 'integer', value: slot },
            { type: 'string', value: randoms },
            { type: 'boolean', value: skipReplace },
        ],
    },
    payment: [{
        assetId: assetId,
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

export const revealRandomsAndReplaceOneDuckMakerTx = (makerRandoms: string, salt: string, rangeToReplace: string, duckId: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "revealRandomsAndReplaceOneDuckMaker",
        args: [
            { type: "string", value: makerRandoms },
            { type: "string", value: salt },
            { type: "string", value: rangeToReplace },
            { type: "string", value: duckId },
        ]
    },
    chainId: CHAIN_ID,
});

export const replaceOneDuckTakerTx = (rangeToReplace: String, duckId: String): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "replaceOneDuckTaker",
        args: [
            { type: "string", value: rangeToReplace },
            { type: "string", value: duckId },
        ]
    },
    chainId: CHAIN_ID,
});

export const commitOrderTakerTx = (orderCommit: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "commitOrderTaker",
        args: [
            { type: "string", value: orderCommit },
        ]
    },
    chainId: CHAIN_ID,
});

export const setOrderMakerTx = (order: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "setOrderMaker",
        args: [
            { type: "string", value: order },
        ]
    },
    chainId: CHAIN_ID,
});

export const revealOrderTakerTx = (order: string, salt: string): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "revealOrderTaker",
        args: [
            { type: "string", value: order },
            { type: "string", value: salt },
        ]
    },
    chainId: CHAIN_ID,
});

export const getPrizeExpiredTx = (): IInvokeScriptParams => ({
    dApp: GAME_ADDRESS,
    fee: 500000,
    call: {
        function: "getPrizeExpired",
    },
    chainId: CHAIN_ID,
});
