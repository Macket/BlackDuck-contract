require('dotenv').config();

export const MAKER_SEED = process.env.MAKER_SEED;
export const TAKER_SEED = process.env.TAKER_SEED;
export const IMPOSTOR_SEED = process.env.IMPOSTOR_SEED;

export const MAKER_WORST_DUCK = process.env.MAKER_WORST_DUCK;
export const MAKER_MEDIUM_DUCK = process.env.MAKER_MEDIUM_DUCK;
export const MAKER_BEST_DUCK = process.env.MAKER_BEST_DUCK;

export const TAKER_WORST_DUCK = process.env.TAKER_WORST_DUCK;
export const TAKER_MEDIUM_DUCK = process.env.TAKER_MEDIUM_DUCK;
export const TAKER_BEST_DUCK = process.env.TAKER_BEST_DUCK;

// Math.random().toString(16).substr(2, 12)
export const MAKER_SALT = process.env.MAKER_SALT;
export const TAKER_SALT = process.env.TAKER_SALT;

export const INCUBATOR_ADDRESS = process.env.INCUBATOR_ADDRESS;
export const FARMING_ADDRESS = process.env.FARMING_ADDRESS;
export const GAME_ADDRESS = process.env.GAME_ADDRESS;

export const EGG_ID = process.env.EGG_ID;
export const WAITING = process.env.WAITING;
export const STEP_DURATION = process.env.STEP_DURATION;

export const CHAIN_ID = process.env.CHAIN_ID;
