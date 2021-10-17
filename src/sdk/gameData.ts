import axios from 'axios';
import { GAME_ADDRESS, FARMING_ADDRESS, EGG_ID, WAVES_NODE } from "../settings";


export const getEggBalance = async (address: string): Promise<number> => {
    const res = await axios.get(WAVES_NODE + `/assets/balance/${address}/${EGG_ID}`);
    return res.data.balance;
};

export const getData = async (regExp): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${GAME_ADDRESS}?matches=${regExp}`);
    return res.data;
};

export const getBlockHeight = async (): Promise<number> => {
    const res = await axios.get(WAVES_NODE + "/blocks/height");
    return res.data.height;
};

export const getNextGameId = async (): Promise<number> => {
    const gameIdData = await getData('nextGameId');
    return gameIdData.length > 0 ? gameIdData[0].value as number : 1
}

type Duck = {assetId: string, genes: string, rarity: number};
type Ducks = { 1: Duck[], 2: Duck[], 3: Duck[], 4: Duck[], 5: Duck[] };

export const getFarmingDucks = async (address: string): Promise<Ducks> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${FARMING_ADDRESS}?matches=address_${address}_.*_farmingPower`);
    const farmingDucks = res.data.filter(d => d.value > 0);

    const ducks = {1: [], 2: [], 3: [], 4: [], 5: []};
    for (let farmingDuck of farmingDucks) {
        const assetId = farmingDuck.key.split("_")[3];
        const genes = (await axios.get(WAVES_NODE + `/assets/details/${assetId}`)).data.name;
        const rarity = farmingDuck.value;
        ducks[Math.min(5, Math.ceil(rarity / 10))].push({assetId, genes, rarity})
    }

    console.log(ducks);

    return ducks
};

export const getPlayerCurrentGame = async (playerAddress: string): Promise<number> => {
    return (await getData(playerAddress + "_currentGame"))[0].value as number;
}

export const getSlot = async (slot: number): Promise<number> => {
    return (await getData('slot' + slot.toString()))[0].value as number;
}

export const getPlayerRole = async (gameId: number, playerAddress: string): Promise<string> => {
    return (await getData('game' + gameId.toString() + "_" + playerAddress))[0].value as string;
}

export const getMaker = async (gameId: number): Promise<string> => {
    return (await getData('game' + gameId.toString() + '_maker'))[0].value as string;
}

export const getTaker = async (gameId: number): Promise<string> => {
    return (await getData('game' + gameId.toString() + '_taker'))[0].value as string;
}

export const getBetEggs = async (gameId: number): Promise<number> => {
    return (await getData('game' + gameId.toString() + '_betEggs'))[0].value as number;
}

export const getWaitingExpirationHeight = async (gameId: number): Promise<number> => {
    return (await getData('game' + gameId.toString() + '_waitingExpirationHeight'))[0].value as number;
}

export const getExpirationHeight = async (gameId: number): Promise<number> => {
    return (await getData('game' + gameId.toString() + '_expirationHeight'))[0].value as number;
}

export const getRarityRange = async (gameId: number, rangePosition: string): Promise<number> => {
    return (await getData('game' + gameId.toString() + '_rarityRange_' + rangePosition))[0].value as number;
}

export const getStep = async (gameId: number): Promise<number> => {
    return (await getData('game' + gameId.toString() + '_step'))[0].value as number;
}

export const getRarity = async (gameId: number, playerRole: 'maker' | 'taker', rangePosition: 'worst' | 'medium' | 'best'): Promise<number> => {
    return (await getData('game' + gameId.toString() + "_" + playerRole + "_" + rangePosition + "Rarity"))[0].value as number;
}

export const getCommit = async (gameId: number, playerRole: 'maker' | 'taker'): Promise<string> => {
    return (await getData('game' + gameId.toString() + "_" + playerRole + "_commit"))[0].value as string;
}

export const getDuckOrder = async (gameId: number, playerRole: 'maker' | 'taker'): Promise<string> => {
    return (await getData('game' + gameId.toString() + "_" + playerRole + "_duckOrder"))[0].value as string;
}

export const getGameResult = async (gameId: number, playerAddress: string): Promise<string> => {
    return (await getData('game' + gameId.toString() + "_" + playerAddress + "_result"))[0].value as string;
}

export const getGamePrize = async (gameId: number, playerAddress: string): Promise<number> => {
    return (await getData('game' + gameId.toString() + "_" + playerAddress + "_prize"))[0].value as number;
}

export const getPlayerWins = async (playerAddress: string): Promise<number> => {
    try {
        return (await getData(playerAddress + '_wins'))[0].value as number;
    } catch (err) {
        return 0
    }
}

export const getPlayerLoses = async (playerAddress: string): Promise<number> => {
    try {
        return (await getData(playerAddress + '_loses'))[0].value as number;
    } catch (err) {
        return 0
    }
}

export const getPlayerDraws = async (playerAddress: string): Promise<number> => {
    try {
        return (await getData(playerAddress + '_draws'))[0].value as number;
    } catch (err) {
        return 0
    }
}

export const getGamesPlayed = async (): Promise<number> => {
    try {
        return (await getData("gamesPlayed"))[0].value as number;
    } catch (err) {
        return 0
    }
}
