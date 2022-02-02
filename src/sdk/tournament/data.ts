import axios from "axios";
import {WAVES_NODE, TOURNAMENT_TICKETS_ADDRESS, TOURNAMENT_ADDRESS} from "../../settings";
import {getData} from "../v2/gameData";


export const getTicketsData = async (regExp): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${TOURNAMENT_TICKETS_ADDRESS}?matches=${regExp}`);
    return res.data;
};

export const getTournamentData = async (regExp): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${TOURNAMENT_ADDRESS}?matches=${regExp}`);
    return res.data;
};

export const getBlockHeight = async (): Promise<number> => {
    const res = await axios.get(WAVES_NODE + "/blocks/height");
    return res.data.height;
};

export const getNextGameId = async (): Promise<number> => {
    const gameIdData = await getTournamentData('nextGameId');
    return gameIdData.length > 0 ? gameIdData[0].value as number : 1
}

export const getHasTicket = async (playerAddress: string): Promise<boolean> => {
    try {
        return (await getTicketsData(playerAddress))[0].value as boolean;
    } catch (err) {
        return false
    }
}

export const getIsTicketsDistributionOver = async (): Promise<boolean> => {
    try {
        return (await getTicketsData("isOver"))[0].value as boolean;
    } catch (err) {
        return false
    }
}

export const getTournamentStartHeight = async (): Promise<number> => {
    try {
        return (await getTournamentData("tournamentStartHeight"))[0].value as number;
    } catch (err) {
        return 0
    }
}

export const getTournamentFinishHeight = async (): Promise<number> => {
    try {
        return (await getTournamentData("tournamentFinishHeight"))[0].value as number;
    } catch (err) {
        return 0
    }
}

export const getPlayerCurrentGame = async (playerAddress: string): Promise<number> => {
    return (await getTournamentData(playerAddress + "_currentGame"))[0].value as number;
}

export const getSlot = async (slot: number): Promise<number> => {
    return (await getTournamentData('slot' + slot.toString()))[0].value as number;
}

export const getPlayerRole = async (gameId: number, playerAddress: string): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerAddress))[0].value as string;
}

export const getMaker = async (gameId: number): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + '_maker'))[0].value as string;
}

export const getTaker = async (gameId: number): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + '_taker'))[0].value as string;
}

export const getTakerSkipReplace = async (gameId: number): Promise<boolean> => {
    return (await getTournamentData('game' + gameId.toString() + '_taker_skipReplace'))[0].value as boolean;
}

export const getBet = async (gameId: number): Promise<number> => {
    return (await getTournamentData('game' + gameId.toString() + '_bet'))[0].value as number;
}

export const getWaitingExpirationHeight = async (gameId: number): Promise<number> => {
    return (await getTournamentData('game' + gameId.toString() + '_waitingExpirationHeight'))[0].value as number;
}

export const getExpirationHeight = async (gameId: number): Promise<number> => {
    return (await getTournamentData('game' + gameId.toString() + '_expirationHeight'))[0].value as number;
}

export const getRanges = async (gameId: number): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + '_ranges'))[0].value as string;
}

export const getMakerRandomsCommit = async (gameId: number): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_maker_randomsCommit"))[0].value as string;
}

export const getRandoms = async (gameId: number, playerRole: 'maker' | 'taker'): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerRole + "_randoms"))[0].value as string;
}

export const getStep = async (gameId: number): Promise<number> => {
    return (await getTournamentData('game' + gameId.toString() + '_step'))[0].value as number;
}

export const getRarities = async (gameId: number, playerRole: 'maker' | 'taker'): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerRole + "_rarities"))[0].value as string;
}

export const getDuckId = async (gameId: number, playerRole: string): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerRole + "_duckId"))[0].value as string;
}

export const getReplacedPosition = async (gameId: number, playerRole: string): Promise<number> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerRole + "_replacedPosition"))[0].value as number;
}

export const getTakerOrderCommit = async (gameId: number): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_taker_orderCommit"))[0].value as string;
}

export const getOrder = async (gameId: number, playerRole: 'maker' | 'taker'): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerRole + "_order"))[0].value as string;
}

export const getPlayerResult = async (gameId: number, playerAddress: string): Promise<string> => {
    return (await getTournamentData('game' + gameId.toString() + "_" + playerAddress + "_result"))[0].value as string;
}

export const getGamesPlayed = async (): Promise<number> => {
    try {
        return (await getTournamentData("gamesPlayed"))[0].value as number;
    } catch (err) {
        return 0
    }
}
