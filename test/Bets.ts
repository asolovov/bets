import {describe} from "mocha";
import {ethers} from "hardhat";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

describe("Bets unit tests", function () {
    async function deployFixture() {
        const [owner, address1, address2, address3] = await ethers.getSigners();

        const Bets = await ethers.getContractFactory("Bets");
        const bets = await Bets.deploy();

        return {
            bets, owner, address1, address2, address3
        }
    }

    describe("Quick testing", function () {
        it("Full flow", async function() {
            const {bets, address1, address2} = await loadFixture(deployFixture);
            let game;
            let bet = ethers.utils.parseEther("0.01")

            await bets.connect(address1).startGame();
            game = await bets.getGame(1);
            expect(game.user1).to.equal(address1.address);
            expect(game.stage).to.equal(0);
            expect(game.turn).to.equal(0);


            await bets.connect(address2).enterGame(1);
            game = await bets.getGame(1);
            expect(game.user1).to.equal(address1.address);
            expect(game.user2).to.equal(address2.address);
            expect(game.stage).to.equal(1);
            expect(game.turn).to.equal(1);

            await expect(bets.connect(address1).enterGame(1)).to.be.revertedWith("Bets: game already has second player");
            await expect(bets.bet(1, {value: bet})).to.be.revertedWith("Bets: not your game");
            await expect(bets.connect(address2).bet(1, {value: bet})).to.be.revertedWith("Bets: not your turn");

            await bets.connect(address1).bet(1, {value: bet});
            game = await bets.getGame(1);
            expect(game.turn).to.equal(2);
            expect(game.betsUser1).to.equal(bet);

            await expect(bets.connect(address1).bet(1, {value: bet})).to.be.revertedWith("Bets: not your turn");

            await bets.connect(address2).bet(1, {value: bet});
            game = await bets.getGame(1);
            expect(game.turn).to.equal(2);
            expect(game.betsUser2).to.equal(bet);
            expect(game.stage).to.equal(2);

            await bets.connect(address2).bet(1, {value: bet});

            await expect(bets.connect(address1).bet(1, {value: bet.div(2)})).to.be.revertedWith("Bets: bets not equal")

            await bets.connect(address1).bet(1, {value: bet});

            game = await bets.getGame(1);
            expect(game.turn).to.equal(1);
            expect(game.stage).to.equal(3);

            await bets.connect(address1).bet(1, {value: bet});
            await bets.connect(address2).bet(1, {value: bet});

            game = await bets.getGame(1);
            expect(game.turn).to.equal(0);
            expect(game.stage).to.equal(4);

            await expect(bets.connect(address1).bet(1, {value: bet})).to.be.revertedWith("Bets: bets not available")
            await expect(bets.connect(address2).bet(1, {value: bet})).to.be.revertedWith("Bets: bets not available")

            console.log(game);

        })

        it.only("Pass", async function() {
            const {bets, address1, address2} = await loadFixture(deployFixture);
            let game;
            let bet = ethers.utils.parseEther("0.01")

            await bets.connect(address1).startGame();
            await bets.connect(address2).enterGame(1);

            await bets.connect(address1).bet(1, {value: bet});
            await bets.connect(address2).bet(1, {value: bet});

            await bets.connect(address2).bet(1, {value: bet});
            const tx = bets.connect(address1).pass(1);

            const bank = bet.mul(3).mul(90).div(100);

            await expect(tx).to.changeEtherBalances([bets, address2], [bank.mul(-1), bank])

            console.log(await bets.getGame(1));
        })
    })
})