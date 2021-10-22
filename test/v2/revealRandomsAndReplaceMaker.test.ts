import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import {broadcastTx, arrayItemAt, generateCommit} from "../../src/sdk/utils";
import {
    commitOrderTakerTx, getPrizeExpiredTx,
    replaceTakerTx, revealOrderTakerTx,
    revealRandomsAndReplaceMakerTx,
    setOrderMakerTx
} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getBlockHeight,
    getRarity,
    getStep,
    getExpirationHeight,
    getRange,
    getRandoms,
    getReplacedRange,
    getDuckId,
    calcRarity,
    getTakerSkipReplace,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    MAKER_SALT,
    IMPOSTOR_SEED,
    STEP_DURATION,
    EGG_ID,
    TAKER_MEDIUM_DUCK,
    TAKER_BEST_DUCK,
    RANGES,
} from "../../src/settings";

export const revealRandomsAndReplaceMakerTest = (randoms: string, rangeToReplace: string, duckId: string, wrongRarityDuckId: string, skipReplace: boolean) => {
    describe('Reveal Randoms And Replace Maker', function () {
        this.timeout(120000);
        const makerRandoms: number[] = randoms.split("|").map(Number);

        it("Impostor can't call", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Taker can't call", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only maker can call this method");
            }
        });

        it("Invalid asset revert", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    "worst",
                    EGG_ID),
                    MAKER_SEED));
            } catch (err) {
                assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
            }
        });

        it("Can't play with alien duck", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    "medium",
                    TAKER_MEDIUM_DUCK),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Asset " + TAKER_MEDIUM_DUCK + " doesn't belong to you");
            }
        });

        if (rangeToReplace === "worst" || rangeToReplace === "medium" || rangeToReplace === "best") {
            it("Duck doesn't fit rarity range revert", async function () {
                try {
                    await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                        makerRandoms[0],
                        makerRandoms[1],
                        makerRandoms[2],
                        makerRandoms[3],
                        makerRandoms[4],
                        makerRandoms[5],
                        MAKER_SALT,
                        rangeToReplace,
                        wrongRarityDuckId),
                        MAKER_SEED));
                } catch (err) {
                    assert.strictEqual(err.message.split(': ')[1], "Duck doesn't fit rarity range");
                }
            });
        }

        it("Randoms don't match commit revert", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    76321,
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Randoms don't match commit");
            }
        });

        it('Invalid random1 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    -1,
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random1')
            }
        });

        it('Invalid random1 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    1000000000001,
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random1')
            }
        });

        it('Invalid random2 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    -1,
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random2')
            }
        });

        it('Invalid random2 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    1000000000001,
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random2')
            }
        });

        it('Invalid random3 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    -1,
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random3')
            }
        });

        it('Invalid random3 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    1000000000001,
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random3')
            }
        });

        it('Invalid random4 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    -1,
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random4')
            }
        });

        it('Invalid random4 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    1000000000001,
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random4')
            }
        });

        it('Invalid random5 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    -1,
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random5')
            }
        });

        it('Invalid random5 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    1000000000001,
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random5')
            }
        });

        it('Invalid random6 revert (<0)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    -1,
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random6')
            }
        });

        it('Invalid random6 revert (>1T)', async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    1000000000001,
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], 'Invalid random6')
            }
        });

        it("Maker reveals and replaces", async function () {
            const gameId = await getPlayerCurrentGame(address(MAKER_SEED, TEST_NET_CHAIN_ID));
            const height = await getBlockHeight();

            await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                makerRandoms[0],
                makerRandoms[1],
                makerRandoms[2],
                makerRandoms[3],
                makerRandoms[4],
                makerRandoms[5],
                MAKER_SALT,
                rangeToReplace,
                duckId),
                MAKER_SEED));

            const makerRandomsStored = await getRandoms(gameId, "maker")
            const makerWorstRarity = await getRarity(gameId, "maker", "worst");
            const makerMediumRarity = await getRarity(gameId, "maker", "medium");
            const makerBestRarity = await getRarity(gameId, "maker", "best");
            const makerReplacedRange = await getReplacedRange(gameId, "maker");
            const makerDuckId = await getDuckId(gameId, "maker");
            const takerWorstRarity = await getRarity(gameId, "taker", "worst");
            const takerMediumRarity = await getRarity(gameId, "taker", "medium");
            const takerBestRarity = await getRarity(gameId, "taker", "best");
            const gameStep = await getStep(gameId);
            const expirationHeight = await getExpirationHeight(gameId);

            const worstRange = await getRange(gameId, "worst");
            const mediumRange = await getRange(gameId, "medium");
            const bestRange = await getRange(gameId, "best");

            const takerRandoms = (await getRandoms(gameId, "taker")).split("|").map(Number);
            const expectedStep = skipReplace ? 3 : 2;

            const makerWorstRarityExpected = rangeToReplace === "worst" ? await calcRarity(duckId) :
                arrayItemAt(RANGES[worstRange - 1], makerRandoms[0] + takerRandoms[0]);
            const makerMediumRarityExpected = rangeToReplace === "medium" ? await calcRarity(duckId) :
                arrayItemAt(RANGES[mediumRange - 1], makerRandoms[1] + takerRandoms[1]);
            const makerBestRarityExpected = rangeToReplace === "best" ? await calcRarity(duckId) :
                arrayItemAt(RANGES[bestRange - 1], makerRandoms[2] + takerRandoms[2]);

            assert.equal(makerRandomsStored, randoms);
            assert.equal(makerWorstRarity, makerWorstRarityExpected);
            assert.equal(makerMediumRarity, makerMediumRarityExpected);
            assert.equal(makerBestRarity, makerBestRarityExpected);
            assert.equal(makerReplacedRange, rangeToReplace);
            assert.equal(makerDuckId, duckId);
            assert.equal(takerWorstRarity, arrayItemAt(RANGES[worstRange - 1], makerRandoms[3] + takerRandoms[3]));
            assert.equal(takerMediumRarity, arrayItemAt(RANGES[mediumRange - 1], makerRandoms[4] + takerRandoms[4]));
            assert.equal(takerBestRarity, arrayItemAt(RANGES[bestRange - 1], makerRandoms[5] + takerRandoms[5]));
            assert.equal(gameStep, expectedStep);
            assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        });

        it("Maker can't call again", async function () {
            try {
                await broadcastTx(invokeScript(revealRandomsAndReplaceMakerTx(
                    makerRandoms[0],
                    makerRandoms[1],
                    makerRandoms[2],
                    makerRandoms[3],
                    makerRandoms[4],
                    makerRandoms[5],
                    MAKER_SALT,
                    rangeToReplace,
                    duckId),
                    MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is finished");
            }
        });

        if (skipReplace) {
            it("Taker can't replace duck", async function () {
                try {
                    await broadcastTx(invokeScript(replaceTakerTx("best", TAKER_BEST_DUCK), TAKER_SEED));
                } catch (err) {
                    assert.strictEqual(err.message.split(': ')[1], "This step is finished");
                }
            });
        }

        if (!skipReplace) {
            it("Taker can't commit order", async function () {
                try {
                    await broadcastTx(invokeScript(commitOrderTakerTx(generateCommit('worst|medium|best', MAKER_SALT)), TAKER_SEED));
                } catch (err) {
                    assert.strictEqual(err.message.split(': ')[1], "This step is not started");
                }
            });
        }

        it("Maker can't set order", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx("best|medium|worst"), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
            }
        });

        it("Taker can't reveal order", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('worst|medium|best', MAKER_SALT), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
            }
        });

        it("Maker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not expired");
            }
        });

        it("Taker can't get prize", async function () {
            try {
                await broadcastTx(invokeScript(getPrizeExpiredTx(), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Game is not expired");
            }
        });
    });
}
