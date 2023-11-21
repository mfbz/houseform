export type NetworkType = 'testnet' | 'mainnet';

export const NETWORK_DATA_MAP = {
	mainnet: {
		contracts: {
			HouseformManager: {
				address: '',
			},
			HouseformShare: {
				address: '',
			},
		},
	},
	testnet: {
		contracts: {
			HouseformManager: {
				address: '0x0d4eF3419af9a0FEE9cc7dBE3EAC4156399f457C',
			},
			HouseformShare: {
				address: '0x3ea99bEa8d5D1Cf76aF585ba207147C653297853',
			},
		},
	},
};

export class KlaytnConstants {
	// This defines the network to be used through the app (mainnet or testnet) loaded through env
	public static NETWORK_TYPE = (process.env.NEXT_PUBLIC_NETWORK_TYPE || 'testnet') as NetworkType;
	// This is always used to access network data
	public static NETWORK_DATA = NETWORK_DATA_MAP[KlaytnConstants.NETWORK_TYPE];
}
