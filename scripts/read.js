const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

const managerContractAddress = '0x9c423c37215ed2D74dC9CD759073d285DFCD50F2';
const shareContractAddress = '0x659016a7b65a9B7A21CF19416bbd0027132deA9f';

async function main() {
	const managerContract = (await ethers.getContractFactory('HouseformManager')).attach(managerContractAddress);
	const shareContract = (await ethers.getContractFactory('HouseformShare')).attach(shareContractAddress);

	console.log(`Share contract address: ${await managerContract.shareContract()}`);
	console.log(`Share contract name: ${await shareContract.name()}`);
	console.log(`Share contract symbol: ${await shareContract.symbol()}`);

	console.log(`Projects: ${await managerContract.getProjects()}`);
	console.log(`Share cost: ${await managerContract.getShareCost(0)}`);

	console.log(
		`Balance of project #0 shares: ${await shareContract.balanceOf('0x93840623bc378e9ee5334c0eE4608CF877dC68D3', 0)}`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
