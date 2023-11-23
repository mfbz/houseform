const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

const managerContractAddress = '0xD1E70DBF3C4666eD34e81A9375dcBbba73Da2A2a';
const shareContractAddress = '0x7e5b21Cb4e4a6B8EA1231e9240e65ba497BD3044';

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
