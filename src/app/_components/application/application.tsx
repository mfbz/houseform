'use client';

import { Button, Layout, theme as ThemeManager, Typography } from 'antd';
import React, { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';
import Icon from '@ant-design/icons';
import { HiOutlineUser } from 'react-icons/hi';

export const Application = function Application({ children }: React.PropsWithChildren) {
	// Antd design token
	const { token } = ThemeManager.useToken();

	// Wagmi account data
	const { address, isConnecting, isConnected, isDisconnected } = useAccount();
	const { connect, connectors, error, isLoading, pendingConnector } = useConnect();

	// NB: Only use metamask that is 0 in connectors array
	const connector = useMemo(() => {
		return connectors[0];
	}, [connectors]);

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Layout style={{ minHeight: '100vh' }}>
				<Layout.Header
					style={{
						height: 64,
						paddingLeft: token.paddingLG,
						paddingRight: token.paddingLG,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						background: 'transparent',
					}}
				>
					<div style={{ display: 'flex' }}>
						<img src={'./houseform-logo.png'} height={32} alt={'houseform logo'}></img>
					</div>

					<div>
						{isDisconnected ? (
							<Button disabled={!connector.ready} onClick={() => connect({ connector })}>
								{'Connect wallet'}
							</Button>
						) : (
							<Button icon={<Icon component={() => <HiOutlineUser />} />} onClick={() => console.log('pressed')}>
								{address?.slice(0, 4) + '...' + address?.slice(-3, address.length)}
							</Button>
						)}
					</div>
				</Layout.Header>

				<Layout.Content style={{ paddingLeft: token.paddingLG, paddingRight: token.paddingLG }}>
					{children}
				</Layout.Content>

				<Layout.Footer style={{ textAlign: 'center', padding: token.paddingLG }}>
					{'Copyright © 2023 Houseform'}
				</Layout.Footer>
			</Layout>
		</Layout>
	);
};
