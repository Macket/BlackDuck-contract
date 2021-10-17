import axios from 'axios';
import { RARITY_PROVIDER_ADDRESS } from "../../settings";

const assetId = '7TckPpGLjcHJ53XVXJ4kXC7aS9vZRhAMSgCtrDGD3K2C';

export const getRarity = async (): Promise<number> => {
    const rarity = (await axios.post(
        `https://nodes-testnet.wavesnodes.com/utils/script/evaluate/${RARITY_PROVIDER_ADDRESS}`,
        {
            "expr": `getAssetRarity(\"${assetId}\")`
        },
    )).data.result.value._2.value;

    return rarity;
};


(async () => console.log(await getRarity()))();
