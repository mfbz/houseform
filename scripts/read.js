const { ethers } = require('hardhat');

// Load env variables
require('dotenv').config();

const managerContractAddress = '0x238a79056ADcc352D5A51AcF9293F81aC5E065D4';
const shareContractAddress = '0xc097DC6F457b10C7e64A78b113A1741b9081928E';

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
