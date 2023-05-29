import hre from "hardhat";
import {ethers} from "ethers";

async function main() {
    const minBet = _getMinBet();

    if (minBet === "" || minBet == null) {
        throw new Error("min bet not found in env, verification reverted")
    }

    await hre.run("verify:verify", {
        address: "0x6cE291AFc8FDfc13ad2EF401D3a6A27Dd044c35E",
        constructorArguments: [ethers.utils.parseEther(minBet)],
    });
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
