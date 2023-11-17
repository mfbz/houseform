'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button, Layout, theme as ThemeManager } from 'antd';
import React from 'react';
import { useAccount } from 'wagmi';

export const Application = function Application({ children }: React.PropsWithChildren) {
  // Antd design token
  const { token } = ThemeManager.useToken();

  // Wagmi account data
  const { address, isConnecting, isDisconnected } = useAccount();
  // Web3 modal hook
  const { open } = useWeb3Modal();

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
          }}>
          <div style={{ display: 'flex' }}>
            <img src={'./houseform-logo.png'} height={32} alt={'houseform logo'}></img>
          </div>

          <div>
            <Button onClick={() => open()}>{'Connect wallet'}</Button>
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
