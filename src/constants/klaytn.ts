export type NetworkType = 'testnet' | 'mainnet';

export const NETWORK_DATA_MAP = {
	mainnet: {
		general: {
			klaytnPrice: 0.15,
		},
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
		general: {
			klaytnPrice: 0.15,
		},
		contracts: {
			HouseformManager: {
				address: '0x9c423c37215ed2D74dC9CD759073d285DFCD50F2',
			},
			HouseformShare: {
				address: '0x659016a7b65a9B7A21CF19416bbd0027132deA9f',
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
