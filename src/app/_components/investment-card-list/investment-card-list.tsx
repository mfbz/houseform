'use client';

import Icon from '@ant-design/icons';
import { Card, List, Modal, Result, Spin, theme as ThemeManager, Typography } from 'antd';
import React, { useCallback } from 'react';
import { HiOutlineCubeTransparent } from 'react-icons/hi';
import { Investment } from '../../_interfaces/investment';
import { InvestmentCard } from './components/investment-card';
import { Metadata } from '../../_interfaces/metadata';

const RESULT_ICON_SIZE = 64;

export const InvestmentCardList = function InvestmentCardList({
	investments,
	showActions,
	disabled,
	onItemClick,
	onGetMetadata,
	onRedeemShares,
}: {
	investments: Investment[];
	showActions?: boolean;
	disabled?: boolean;
	onItemClick: (projectId: bigint) => void;
	onGetMetadata: (projectId: bigint) => Promise<Metadata | null> | Metadata | null;
	onRedeemShares: (projectId: bigint, shares: number) => Promise<void> | void;
}) {
	const { token } = ThemeManager.useToken();

	// To handle buy shares loading modal
	const [loadingModal, loadingModalContextHolder] = Modal.useModal();
	// To handle buying shares for a investment
	const onRedeemSharesWrapper = useCallback(
		async (projectId: bigint, shares: number) => {
			const instance = loadingModal.success({
				icon: null,
				title: 'Redeeming ' + shares + (shares > 1 ? ' shares ...' : ' share ...'),
				content: (
					<Result
						icon={
							<Spin
								indicator={
									<Icon
										style={{ fontSize: RESULT_ICON_SIZE, color: token.colorPrimary }}
										component={(props: any) => <HiOutlineCubeTransparent {...props} fill={'none'} />}
										spin={true}
									/>
								}
							/>
						}
						title={'Submitting transaction...'}
						style={{ paddingTop: token.paddingLG, paddingBottom: token.paddingLG }}
					/>
				),
				footer: null,
				closable: false,
				centered: true,
				maskClosable: false,
			});

			await onRedeemShares(projectId, shares);
			instance.destroy();
		},
		[loadingModal, token, onRedeemShares],
	);

	return (
		<>
			{loadingModalContextHolder}
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<List
					grid={{ gutter: token.margin, column: 1 }}
					dataSource={investments}
					locale={{
						emptyText: (
							<Card>
								<Typography.Text type={'secondary'}>{'No data'}</Typography.Text>
							</Card>
						),
					}}
					renderItem={(item, index) => (
						<List.Item>
							<InvestmentCard
								investment={item}
								showActions={showActions}
								onClick={() => onItemClick(item.project.projectId)}
								onGetMetadata={async () => await onGetMetadata(item.project.projectId)}
								onRedeemShares={async (shares) => await onRedeemSharesWrapper(item.project.projectId, shares)}
								disabled={disabled}
							/>
						</List.Item>
					)}
				/>
			</div>
		</>
	);
};
