'use client';

import { Badge, Button, Card, Statistic, theme as ThemeManager, Typography, Avatar } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Investment } from '../../../_interfaces/investment';
import { Metadata } from '../../../_interfaces/metadata';
import { ProjectUtils } from '../../../_utils/project-utils';
import { TokenUtils } from '../../../_utils/token-utils';
import Icon from '@ant-design/icons';
import { HiOutlineIdentification } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

export const InvestmentCard = function InvestmentCard({
	investment,
	showActions,
	disabled,
	onClick,
	onGetMetadata,
	onRedeemShares,
}: {
	investment: Investment;
	showActions?: boolean;
	disabled?: boolean;
	onClick: () => void;
	onGetMetadata: () => Promise<Metadata | null> | Metadata | null;
	onRedeemShares: (shares: number) => Promise<void> | void;
}) {
	const { address, isConnecting, isConnected, isDisconnected } = useAccount();

	const router = useRouter();
	const { token } = ThemeManager.useToken();

	// Get investment state
	const projectState = useMemo(() => {
		if (!investment) return null;
		return ProjectUtils.getProjetState(investment.project);
	}, [investment]);

	const [metadata, setMetadata] = useState<Metadata | null>(null);
	useEffect(() => {
		const fetchMetadata = async () => {
			const _metadata = await onGetMetadata();
			setMetadata(_metadata);
		};
		fetchMetadata();
	}, [onGetMetadata]);

	const shareCost = useMemo(() => {
		return investment.project.goalAmount / BigInt(investment.project.totalShares);
	}, [investment]);

	const shareValue = useMemo(() => {
		// Fundraising not finished yet
		if (investment.project.saleAmount == BigInt(0)) {
			return investment.project.goalAmount / BigInt(investment.project.totalShares);
		}

		// Depending on profit for builder fee calculation
		if (investment.project.saleAmount - investment.project.goalAmount > BigInt(0)) {
			// Profit
			const builderFeeAmount =
				((investment.project.saleAmount - investment.project.goalAmount) * BigInt(investment.project.builderFee)) /
				BigInt(100);
			return (investment.project.saleAmount - builderFeeAmount) / BigInt(investment.project.totalShares);
		} else {
			// No profit
			return investment.project.saleAmount / BigInt(investment.project.totalShares);
		}
	}, [investment]);

	// Calculate profit
	const profit = useMemo(() => {
		return (Number(((shareValue - shareCost) * BigInt(100)) / shareCost) / 100) * 100;
	}, [shareValue, shareCost]);

	return (
		<Badge.Ribbon
			text={projectState ? ProjectUtils.getProjetStateData(projectState)[0] : undefined}
			color={projectState ? ProjectUtils.getProjetStateData(projectState)[1] : undefined}
		>
			<Card bodyStyle={{ padding: 0 }}>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<div style={{ height: 'auto', padding: token.margin, cursor: 'pointer' }} onClick={onClick}>
						<img src={metadata?.image} width={300} height={'100%'} style={{ borderRadius: token.borderRadius }} />
					</div>

					<div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: token.paddingLG }}>
						<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
							<div
								style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
							>
								<div
									style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}
									onClick={() => router.push('/users/' + investment.project.builder)}
								>
									<Avatar
										shape={'circle'}
										icon={
											<Icon
												style={{ color: token.colorText }}
												component={(props: any) => <HiOutlineIdentification {...props} fill={'none'} />}
											/>
										}
										style={{ backgroundColor: token.colorBgLayout }}
									/>

									<Typography.Text type={'secondary'} style={{ marginLeft: token.margin / 2, fontSize: '0.9em' }}>
										{investment.project.builder.slice(0, 4) +
											'...' +
											investment.project.builder.slice(-4, investment.project.builder.length)}
									</Typography.Text>
								</div>
							</div>

							<Typography.Title level={5} style={{ marginTop: token.margin }}>
								{metadata?.name}
							</Typography.Title>

							<Typography.Text style={{ overflow: 'hidden' }}>{metadata?.description}</Typography.Text>
						</div>

						<div style={{ display: 'flex', flexDirection: 'row', marginTop: token.margin }}>
							<Statistic title={'Shares'} value={investment.shares} style={{ marginRight: token.margin }} />

							<Statistic
								title={'Value'}
								value={TokenUtils.toNumber(shareValue * BigInt(investment.shares), 18)}
								valueStyle={{ color: '#1677FF' }}
								suffix={'KLAY'}
								style={{ marginRight: token.margin }}
							/>

							{projectState === 'completed' && profit > -99 && (
								<Statistic
									title={'Profit'}
									value={profit}
									valueStyle={{ color: profit >= 0 ? '#52C41A' : '#FF4D4F' }}
									suffix={'%'}
								/>
							)}
						</div>

						{showActions && (
							<div style={{ marginTop: token.margin }}>
								<Button
									type={'primary'}
									onClick={() => onRedeemShares(investment.shares)}
									disabled={disabled || projectState !== 'completed'}
								>
									{'Redeem shares'}
								</Button>
							</div>
						)}
					</div>
				</div>
			</Card>
		</Badge.Ribbon>
	);
};
