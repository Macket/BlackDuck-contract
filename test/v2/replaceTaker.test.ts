import { assert } from 'chai';
import { address, TEST_NET_CHAIN_ID } from '@waves/ts-lib-crypto';
import { invokeScript } from "@waves/waves-transactions";
import { broadcastTx } from "../../src/sdk/utils";
import {
    getPrizeExpiredTx,
    replaceTakerTx,
    revealOrderTakerTx,
    setOrderMakerTx
} from "../../src/sdk/v2/gameTransactions";
import {
    getPlayerCurrentGame,
    getBlockHeight,
    getRarities,
    getStep,
    getExpirationHeight,
    getReplacedPosition,
    getDuckId,
    calcRarity,
} from "../../src/sdk/v2/gameData";
import {
    MAKER_SEED,
    TAKER_SEED,
    IMPOSTOR_SEED,
    STEP_DURATION,
    EGG_ID,
    MAKER_BEST_DUCK,
    TAKER_SALT,
} from "../../src/settings";

export const replaceTakerTest = (replacePosition: number, duckId: string, wrongRarityDuckId: string) => {
    describe('Replace Taker', function () {
        this.timeout(120000);

        it("Impostor can't call", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(replacePosition, duckId), IMPOSTOR_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "You don't have an active game");
            }
        });

        it("Maker can't call", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(replacePosition, duckId), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "Only taker can call this method");
            }
        });

        if ([1, 2, 3].includes(replacePosition)) {
            it("Invalid asset revert", async function () {
                try {
                    await broadcastTx(invokeScript(replaceTakerTx(replacePosition, EGG_ID), TAKER_SEED));
                } catch (err) {
                    assert.isTrue(err.message.split(': ')[1].includes('not valid NFT'));
                }
            });
        }

        if ([1, 2, 3].includes(replacePosition)) {
            it("Can't play with alien duck", async function () {
                try {
                    await broadcastTx(invokeScript(replaceTakerTx(replacePosition, MAKER_BEST_DUCK), TAKER_SEED));
                } catch (err) {
                    assert.strictEqual(err.message.split(': ')[1], "Asset " + MAKER_BEST_DUCK + " doesn't belong to you");
                }
            });
        }

        if ([1, 2, 3].includes(replacePosition)) {
            it("Duck doesn't fit rarity range revert", async function () {
                try {
                    await broadcastTx(invokeScript(replaceTakerTx(replacePosition, wrongRarityDuckId), TAKER_SEED));
                } catch (err) {
                    assert.strictEqual(err.message.split(': ')[1], "Duck doesn't fit rarity range");
                }
            });
        }

        it("Taker replaces", async function () {
            const height = await getBlockHeight();
            const gameId = await getPlayerCurrentGame(address(TAKER_SEED, TEST_NET_CHAIN_ID));

            await broadcastTx(invokeScript(replaceTakerTx(replacePosition, duckId), TAKER_SEED));

            const takerReplacedRange = await getReplacedPosition(gameId, "taker");
            const takerDuckId = await getDuckId(gameId, "taker");
            const takerBestRarity = (await getRarities(gameId, "taker")).split("|").map(Number)[replacePosition - 1];
            const gameStep = await getStep(gameId);
            const expirationHeight = await getExpirationHeight(gameId);

            if ([1, 2, 3].includes(replacePosition)) {
                const replacedRarity = await calcRarity(duckId);
                assert.equal(takerBestRarity, replacedRarity);
            }
            assert.equal(takerReplacedRange, replacePosition);
            assert.equal(takerDuckId, duckId);
            assert.equal(gameStep, 3);
            assert.approximately(expirationHeight, height + STEP_DURATION, 1);
        });

        it("Taker can't call again", async function () {
            try {
                await broadcastTx(invokeScript(replaceTakerTx(replacePosition, duckId), TAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is finished");
            }
        });

        it("Maker can't set order", async function () {
            try {
                await broadcastTx(invokeScript(setOrderMakerTx("3|2|1"), MAKER_SEED));
            } catch (err) {
                assert.strictEqual(err.message.split(': ')[1], "This step is not started");
            }
        });

        it("Taker can't reveal order", async function () {
            try {
                await broadcastTx(invokeScript(revealOrderTakerTx('1|2|3', TAKER_SALT), TAKER_SEED));
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
