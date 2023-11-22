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
				address: '0xc79838Dd48374599D179748Baeeb6564E7B9b49B',
			},
			HouseformShare: {
				address: '0x480a5C20F8B995A7ac7e40Fead391B08De31DfCf',
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
