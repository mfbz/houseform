'use client';

import Icon from '@ant-design/icons';
import { Card, List, Modal, Result, Spin, theme as ThemeManager, Typography } from 'antd';
import { useCallback } from 'react';
import { HiOutlineCubeTransparent } from 'react-icons/hi';
import { Metadata } from '../../_interfaces/metadata';
import { Project } from '../../_interfaces/project';
import { BuildingCard } from './components/building-card';

const RESULT_ICON_SIZE = 64;

export const BuildingCardList = function BuildingCardList({
	projects,
	showActions,
	disabled,
	onGetMetadata,
	onStartBuilding,
	onCompleteBuilding,
	onRedeemFee,
}: {
	projects: Project[];
	showActions?: boolean;
	disabled?: boolean;
	onGetMetadata: (projectId: number) => Promise<Metadata | null> | Metadata | null;
	onStartBuilding: (projectId: number) => Promise<void> | void;
	onCompleteBuilding: (projectId: number, saleAmount: bigint) => Promise<void> | void;
	onRedeemFee: (projectId: number) => Promise<void> | void;
}) {
	const { token } = ThemeManager.useToken();

	// To handle buy shares loading modal
	const [loadingModal, loadingModalContextHolder] = Modal.useModal();
	// To wrap actions in show loading modal
	const loadingWrapper = useCallback(
		async (title: string, callback: () => Promise<void> | void) => {
			const instance = loadingModal.success({
				icon: null,
				title,
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

			await callback();
			instance.destroy();
		},
		[loadingModal, token],
	);
	// To actions
	const _onStartBuilding = useCallback(
		async (projectId: number) => {
			await loadingWrapper('Starting building...', async () => await onStartBuilding(projectId));
		},
		[loadingWrapper, onStartBuilding],
	);
	const _onCompleteBuilding = useCallback(
		async (projectId: number, saleAmount: bigint) => {
			await loadingWrapper('Completing building...', async () => await onCompleteBuilding(projectId, saleAmount));
		},
		[loadingWrapper, onCompleteBuilding],
	);
	const _onRedeemFee = useCallback(
		async (projectId: number) => {
			await loadingWrapper('Redeeming fee...', async () => await onRedeemFee(projectId));
		},
		[loadingWrapper, onRedeemFee],
	);

	return (
		<>
			{loadingModalContextHolder}
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<List
					grid={{ gutter: token.margin, column: 1 }}
					dataSource={projects}
					locale={{
						emptyText: (
							<Card>
								<Typography.Text type={'secondary'}>{'No data'}</Typography.Text>
							</Card>
						),
					}}
					renderItem={(item, index) => (
						<List.Item>
							<BuildingCard
								project={item}
								showActions={showActions}
								onGetMetadata={async () => await onGetMetadata(index)}
								onStartBuilding={async () => await _onStartBuilding(index)}
								onCompleteBuilding={async (saleAmount) => await _onCompleteBuilding(index, saleAmount)}
								onRedeemFee={async () => await _onRedeemFee(index)}
								disabled={disabled}
							/>
						</List.Item>
					)}
				/>
			</div>
		</>
	);
};
