import { LIGHT_THEME } from '@/themes/light-theme';
import { App as AntdWrapper, ConfigProvider } from 'antd';
import type { Metadata } from 'next';
import { AntdRegistry } from './_components/antd-registry';
import { Application } from './_components/application';
import { WagmiProvider } from './_components/wagmi-provider';

// Load global css
import '@/styles/global.css';

// Main app metadata
export const metadata: Metadata = {
	title: 'Houseform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<AntdRegistry>
					<ConfigProvider theme={LIGHT_THEME}>
						<AntdWrapper>
							<WagmiProvider>
								<Application>{children}</Application>
							</WagmiProvider>
						</AntdWrapper>
					</ConfigProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
