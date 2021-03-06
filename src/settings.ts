import { _MAKER_SEED, _TAKER_SEED, _IMPOSTOR_SEED, _TOURNAMENT_ADMIN_SEED } from "./seeds";

// --- COMMON ---
export const MAKER_SEED = _MAKER_SEED;
export const TAKER_SEED = _TAKER_SEED;
export const IMPOSTOR_SEED = _IMPOSTOR_SEED;

export const EGG_ID = "AjXHBGsVDeXETQPk3qH4CPbZdfXPyNo5XoBx7jVbtwWG"
export const WRONG_ASSET_ID = "3VUCuh9dWqe54SdzzNUkXhFXpc8UQynnJVh42B7MjNzN" // Old EGG
export const WAITING = 8
export const STEP_DURATION = 5

export const CHAIN_ID = "T"

export const WAVES_NODE = "https://nodes-testnet.wavesnodes.com"

export const MAKER_SALT = "dff8b213b4fb"
export const TAKER_SALT = "3441badf6795"

export const INCUBATOR_ADDRESS = "3MtBigTsaeevrcJAEwVcr4quwkqcrtnjoAh"
export const FARMING_ADDRESS = "3NBznG19rEYUAcnukTRTtwJHBVKQLbobVdC"
export const FEE_AGGREGATOR = "3MwikA4opnqZMGVriWzH8Gq2CJXuaVBdboH"

export const GAME_ADDRESS = "3N6oaapvYkEryHUr4vAiPRXM3iS6kMYXito"
export const RARITY_PROVIDER_ADDRESS = '3NCman4dCzk1HWWU4DPTr5rsbhvuUCwwUZh';


// --- v1 ---
export const MAKER_WORST_DUCK = "2b85F6Lm7CuReUdR7XEhMYLJ8YLujiZXXSvsFRoD8X7Y" // FFFFFFFF 13
export const MAKER_MEDIUM_DUCK = "79ii5gyBYuSgW9Agqu7jgU9XBcbJTq63DZL3NXK5Bywt" // EEEEEEEE 22
export const MAKER_MEDIUM_DUCK2 = "PugXTSxYU9KirtkBM3L3ANrbN8TRHgd1KhugRupDNHD" // AAAAAAAA 27
export const MAKER_BEST_DUCK = "9cohHvTdYnDd1nNNkhKkNmwkdJ8QxfYUAZ5QJxLV7LVQ" // DDDDDDDD 33

export const TAKER_WORST_DUCK = "2cpVcSMygKsVfoq6xw7WvByYZF7eSK1y8sJcpJrm5e4a" // FFFFFFFF 13
export const TAKER_MEDIUM_DUCK = "3ToP4Yn6R8K6sG25vvreKFYq2u7ubqZUqiWzgK2hFjgM" // AAAAAAAA 27
export const TAKER_MEDIUM_DUCK_SAME_RARITY = "GmVjgyr8ErDsMtMkGRQLjL1vJXprfrSVFPQPU5g7QpZY" // AAAAAAAA 27
export const TAKER_MEDIUM_DUCK2 = "BxGKzvitpyURphUGNh8fAZwKEKWyA9AHZjjy65ip6DMA" // EEEEEEEE 22
export const TAKER_BEST_DUCK = "7TckPpGLjcHJ53XVXJ4kXC7aS9vZRhAMSgCtrDGD3K2C" // CCCCCCCC 37 (FARMING)

export const IMPOSTOR_WORST_DUCK = "2cpju1quwrrWZnbKnfbhDCib3rHZeEv4Kuw9rovaig4e" // FFFFFFFF 13
export const IMPOSTOR_MEDIUM_DUCK = "DkaR26dUbbi6B38oS93MmpiNmjTDCYXiJZooY2oV1HV1" // AAAAAAAA 27
export const IMPOSTOR_MEDIUM_DUCK2 = "D2dyUPWGZDvB9v8ip1vLfHJqjk73mBWKUhh5odxjv5b4" // EEEEEEEE 22
export const IMPOSTOR_BEST_DUCK = "4TprF5GgPtNtLPMTe1qjuPYtwd6EVYkCqpeQsqkYFp9L" // CCCCCCCC 37

// --- v2 ---
export const RANDOMS1 = "1234|44|97657|2|23|286482784265"
export const RANDOMS2 = "736487|235325323|213|2424|0|11"
// Ranges: 2,3,4. Maker: 12|21|31, Taker: 17|26|33
// Ranges: 2,2,2. Maker: 12|18|11, Taker: 17|14|17

export const RANGES = [
    [2, 3, 4, 5, 6, 7, 8, 9],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27, 28, 30],
    [31, 33, 35, 37, 40],
    [44, 50, 57, 70, 100]
]

export const FEE_PERCENT = 10;

// --- TOURNAMENT ---
export const TOURNAMENT_ADDRESS = "3MzkgzQJkWqyk6KB8xzy6KYydcC2kjFvadk";
export const TOURNAMENT_ADMIN_SEED = _TOURNAMENT_ADMIN_SEED;
export const TOURNAMENT_TICKETS_ADDRESS = "3N4WNtTySg6yVzp58h2dwrLtpP353yVoUco";
