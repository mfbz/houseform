const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

async function main() {
	const deployerAddress = process.env.HARDHAT_KLAYTN_ACCOUNT_ADDRESS;
	const deployer = await ethers.getSigner(deployerAddress);

	console.log(`Deploying contracts with the account: ${deployer.address}`);
	console.log(`Account balance: ${(await deployer.provider.getBalance(deployerAddress)).toString()}`);

	const contract = await ethers.deployContract('HouseformManager');
	await contract.waitForDeployment();

	const contractAddress = await contract.getAddress();

	console.log(`HouseformManager contract deployed`);
	console.log(`Contract address is ${contractAddress}`);
	console.log(`Check it on https://baobab.scope.klaytn.com/account/${contractAddress}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
