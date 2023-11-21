require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
	solidity: {
		version: '0.8.20',
		settings: {
			optimizer: {
				enabled: true,
				runs: 2000,
			},
		},
	},
	networks: {
		baobab: {
			url: process.env.HARDHAT_KLAYTN_BAOBAB_TESTNET_URL || '',
			gasPrice: 250000000000,
			accounts:
				process.env.HARDHAT_KLAYTN_ACCOUNT_PRIVATE_KEY !== undefined
					? [process.env.HARDHAT_KLAYTN_ACCOUNT_PRIVATE_KEY]
					: [],
		},
	},
};
