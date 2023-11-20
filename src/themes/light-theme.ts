import type { ThemeConfig } from 'antd';

export const LIGHT_THEME: ThemeConfig = {
	token: {
		fontSize: 16,
		colorTextBase: '#191923',
		borderRadius: 16,
	},
	components: {
		Input: {
			borderRadius: 8,
			borderRadiusLG: 8,
			borderRadiusSM: 8,
			borderRadiusXS: 8,
			borderRadiusOuter: 8,
		},
		InputNumber: {
			borderRadius: 8,
			borderRadiusLG: 8,
			borderRadiusSM: 8,
			borderRadiusXS: 8,
			borderRadiusOuter: 8,
		},
	},
};
