import axios from "axios";
import {WAVES_NODE, TOURNAMENT_TICKETS_ADDRESS, TOURNAMENT_ADDRESS} from "../../settings";


export const getTicketsData = async (regExp): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${TOURNAMENT_TICKETS_ADDRESS}?matches=${regExp}`);
    return res.data;
};

export const getTournamentData = async (regExp): Promise<{ key: string, type: string, value: string | number | boolean }[]> => {
    const res = await axios.get(WAVES_NODE + `/addresses/data/${TOURNAMENT_ADDRESS}?matches=${regExp}`);
    return res.data;
};

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
