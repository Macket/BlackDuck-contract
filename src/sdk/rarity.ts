import axios from 'axios';
import { FARMING_ADDRESS } from "../settings";

const assetId = '3ToP4Yn6R8K6sG25vvreKFYq2u7ubqZUqiWzgK2hFjgM';

export const getRarity = async (): Promise<number> => {
    const rarity = (await axios.post(
        `https://nodes-testnet.wavesnodes.com/utils/script/evaluate/${FARMING_ADDRESS}`,
        {
            "expr": `getAssetRarityCallable(\"${assetId}\")`
        },
    )).data.result.value._2.value;

    return rarity;
};

// export const getMaker = async (): Promise<number> => {
//     const rarity = (await axios.post(
//         `https://nodes-testnet.wavesnodes.com/utils/script/evaluate/${FARMING_ADDRESS}`,
//         {
//             "expr": `getGameMakerKey(1)`
//         },
//     ));
//
//     return rarity;
// };


(async () => console.log(await getRarity()))();
