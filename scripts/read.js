const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

const managerContractAddress = '0x0d4eF3419af9a0FEE9cc7dBE3EAC4156399f457C';
const shareContractAddress = '0x3ea99bEa8d5D1Cf76aF585ba207147C653297853';

async function main() {
	const managerContract = (await ethers.getContractFactory('HouseformManager')).attach(managerContractAddress);
	const shareContract = (await ethers.getContractFactory('HouseformShare')).attach(shareContractAddress);

	console.log(`Share contract address: ${await managerContract.shareContract()}`);
	console.log(`Share contract name: ${await shareContract.name()}`);
	console.log(`Share contract symbol: ${await shareContract.symbol()}`);

	console.log(`Projects: ${await managerContract.getProjects()}`);
	//console.log(`Project metadata: ${await shareContract.uri(0)}`);

	console.log(
		`Balance of project #0 shares: ${await shareContract.balanceOf('0x93840623bc378e9ee5334c0eE4608CF877dC68D3', 0)}`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
