const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

const managerContractAddress = '0x3a5CC2Be65e56d896f0D3adf427474c33239a1F9';
const shareContractAddress = '0x873340073b531a2F76b8c0e7567A434f762Eae31';

async function main() {
	const managerContract = (await ethers.getContractFactory('HouseformManager')).attach(managerContractAddress);
	const shareContract = (await ethers.getContractFactory('HouseformShare')).attach(shareContractAddress);

	console.log(`Share contract address: ${await managerContract.shareContract()}`);
	console.log(`Share contract name: ${await shareContract.name()}`);
	console.log(`Share contract symbol: ${await shareContract.symbol()}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
