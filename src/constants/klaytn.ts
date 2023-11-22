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
				address: '0x238a79056ADcc352D5A51AcF9293F81aC5E065D4',
			},
			HouseformShare: {
				address: '0xc097DC6F457b10C7e64A78b113A1741b9081928E',
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
