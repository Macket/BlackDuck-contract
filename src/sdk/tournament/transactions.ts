import { IInvokeScriptParams } from "@waves/waves-transactions";
import { EGG_ID, TOURNAMENT_TICKETS_ADDRESS, TOURNAMENT_ADDRESS, CHAIN_ID } from "../../settings";

export const getTicketTx = (): IInvokeScriptParams => ({
    dApp: TOURNAMENT_TICKETS_ADDRESS,
    fee: 500000,
    call: {
        function: "getTicket",
        args: [],
    },
    payment: [{
        assetId: EGG_ID,
        amount: 100000000,
    }],
    chainId: CHAIN_ID,
});

export const stopTicketsDistributionTx = (): IInvokeScriptParams => ({
    dApp: TOURNAMENT_TICKETS_ADDRESS,
    fee: 500000,
    call: {
        function: "stop",
        args: [],
    },
    payment: [],
    chainId: CHAIN_ID,
});


export const startTournamentTx = (): IInvokeScriptParams => ({
    dApp: TOURNAMENT_ADDRESS,
    fee: 500000,
    call: {
        function: "startTournament",
        args: [],
    },
    payment: [],
    chainId: CHAIN_ID,
});

export const makeGameTx = (
    slot: number,
    worstRange: number,
    mediumRange: number,
    bestRange: number,
    randomsCommit: string,
    eggs: number,
    assetId = EGG_ID,
): IInvokeScriptParams => ({
    dApp: TOURNAMENT_ADDRESS,
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

export const takeGameTx = (
    slot: number,
    random1: number,
    random2: number,
    random3: number,
    random4: number,
    random5: number,
    random6: number,
    skipReplace: boolean,
    eggs: number,
    assetId = EGG_ID
): IInvokeScriptParams => ({
    dApp: TOURNAMENT_ADDRESS,
    fee: 500000,
    call: {
        function: "takeGame",
        args: [
            { type: 'integer', value: slot },
            { type: 'integer', value: random1 },
            { type: 'integer', value: random2 },
            { type: 'integer', value: random3 },
            { type: 'integer', value: random4 },
            { type: 'integer', value: random5 },
            { type: 'integer', value: random6 },
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
    dApp: TOURNAMENT_ADDRESS,
    fee: 500000,
    call: {
        function: "kickGame",
        args: [
            { type: 'integer', value: slot },
        ],
    },
    chainId: CHAIN_ID,
});