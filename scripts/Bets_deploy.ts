import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    const minBet = _getMinBet();

    if (minBet === "" || minBet == null) {
        throw new Error("min bet not found in env, deploy reverted")
    }

    const minBetMATIC = ethers.utils.parseEther(minBet);

    console.log("Deploying Bets contract with the account:", deployer.address);

    const Bets = await ethers.getContractFactory("Bets");
    const gasPrice = await Bets.signer.getGasPrice();
    console.log(`Current gas price: ${gasPrice}`);
    const estimatedGas = await Bets.signer.estimateGas(
        Bets.getDeployTransaction(minBetMATIC),
    );
    console.log(`Estimated gas: ${estimatedGas}`);
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await Bets.signer.getBalance();
    console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
    if (Number(deployerBalance) < Number(deploymentPrice)) {
        throw new Error("You dont have enough balance to deploy.");
    }

    const bets = await Bets.deploy(minBetMATIC);

    await bets.deployed();

    console.log("Bets contract deployed to address:", bets.address);
}

function _getMinBet() {
    return process.env.MIN_BET as string;
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error:", error);
        process.exit(1);
    });
