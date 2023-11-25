'use client';

import { Avatar, Badge, Button, Card, Form, InputNumber, Statistic, theme as ThemeManager, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Metadata } from '../../../_interfaces/metadata';
import { Project } from '../../../_interfaces/project';
import { ProjectUtils } from '../../../_utils/project-utils';
import { TokenUtils } from '../../../_utils/token-utils';
import Icon from '@ant-design/icons';
import { HiOutlineIdentification } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

export const BuildingCard = function BuildingCard({
	project,
	showActions,
	disabled,
	onClick,
	onGetMetadata,
	onStartBuilding,
	onCompleteBuilding,
	onRedeemFee,
}: {
	project: Project;
	showActions?: boolean;
	disabled?: boolean;
	onClick: () => void;
	onGetMetadata: () => Promise<Metadata | null> | Metadata | null;
	onStartBuilding: () => Promise<void> | void;
	onCompleteBuilding: (saleAmount: bigint) => Promise<void> | void;
	onRedeemFee: () => Promise<void> | void;
}) {
	const { address, isConnecting, isConnected, isDisconnected } = useAccount();

	const router = useRouter();
	const { token } = ThemeManager.useToken();

	// Get project state
	const projectState = useMemo(() => {
		return ProjectUtils.getProjetState(project);
	}, [project]);

	const [metadata, setMetadata] = useState<Metadata | null>(null);
	useEffect(() => {
		const fetchMetadata = async () => {
			const _metadata = await onGetMetadata();
			setMetadata(_metadata);
		};
		fetchMetadata();
	}, [onGetMetadata]);

	const shareCost = useMemo(() => {
		return project.goalAmount / BigInt(project.totalShares);
	}, [project]);

	const shareValue = useMemo(() => {
		// Fundraising not finished yet
		if (project.saleAmount == BigInt(0)) {
			return project.goalAmount / BigInt(project.totalShares);
		}

		// Depending on profit for builder fee calculation
		if (project.saleAmount - project.goalAmount > BigInt(0)) {
			// Profit
			const builderFeeAmount = ((project.saleAmount - project.goalAmount) * BigInt(project.builderFee)) / BigInt(100);
			return (project.saleAmount - builderFeeAmount) / BigInt(project.totalShares);
		} else {
			// No profit
			return project.saleAmount / BigInt(project.totalShares);
		}
	}, [project]);

	return (
		<Badge.Ribbon
			text={projectState ? ProjectUtils.getProjetStateData(projectState)[0] : undefined}
			color={projectState ? ProjectUtils.getProjetStateData(projectState)[1] : undefined}
		>
			<Card bodyStyle={{ padding: 0 }}>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<div style={{ display: 'flex', height: 'auto', padding: token.margin, cursor: 'pointer' }} onClick={onClick}>
						<img src={metadata?.image} width={300} height={'100%'} style={{ borderRadius: token.borderRadius }} />
					</div>

					<div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: token.paddingLG }}>
						<div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
							<div
								style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
							>
								<div
									style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }}
									onClick={() => router.push('/users/' + project.builder)}
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
										{project.builder.slice(0, 4) + '...' + project.builder.slice(-4, project.builder.length)}
									</Typography.Text>
								</div>
							</div>

							<Typography.Title level={5} style={{ marginTop: token.margin }}>
								{metadata?.name}
							</Typography.Title>

							<Typography.Text style={{ overflow: 'hidden' }}>{metadata?.description}</Typography.Text>
						</div>

						<div style={{ display: 'flex', flexDirection: 'row', marginTop: token.margin }}>
							{projectState === 'fundraising' ? (
								<Statistic
									title={'Fundraising deadline'}
									value={new Date(project.fundraisingDeadline * 1000).toLocaleDateString('en-us', {
										day: 'numeric',
										month: 'short',
									})}
									style={{ marginRight: token.margin }}
								/>
							) : projectState === 'expired' ? (
								<Statistic
									title={'Fundraising expired'}
									value={new Date(project.fundraisingDeadline * 1000).toLocaleDateString('en-us', {
										day: 'numeric',
										month: 'short',
									})}
									valueStyle={{ color: '#FF4D4F' }}
									style={{ marginRight: token.margin }}
								/>
							) : projectState === 'preparing' ? (
								<Statistic
									title={'Fundraising completed'}
									value={new Date(project.fundraisingCompletedOn * 1000).toLocaleDateString('en-us', {
										day: 'numeric',
										month: 'short',
									})}
									style={{ marginRight: token.margin }}
								/>
							) : projectState === 'started' ? (
								<Statistic
									title={'Building started'}
									value={new Date(project.buildingStartedOn * 1000).toLocaleDateString('en-us', {
										day: 'numeric',
										month: 'short',
									})}
									style={{ marginRight: token.margin }}
								/>
							) : (
								<Statistic
									title={'Building completed'}
									value={new Date(project.buildingCompletedOn * 1000).toLocaleDateString('en-us', {
										day: 'numeric',
										month: 'short',
									})}
									style={{ marginRight: token.margin }}
								/>
							)}

							<Statistic
								title={'Goal amount'}
								value={Math.round(TokenUtils.toNumber(project.goalAmount, 18))}
								suffix={'KLAY'}
							/>
						</div>

						{showActions && (
							<div style={{ marginTop: token.margin }}>
								{projectState === 'fundraising' ? (
									<Button type={'primary'} disabled={true}>
										{'Start building'}
									</Button>
								) : projectState === 'expired' ? (
									<Button type={'primary'} disabled={true}>
										{'Start building'}
									</Button>
								) : projectState === 'preparing' ? (
									<Button type={'primary'} disabled={disabled} onClick={onStartBuilding}>
										{'Start building'}
									</Button>
								) : projectState === 'started' ? (
									<Form
										layout={'inline'}
										initialValues={{ saleAmount: TokenUtils.toNumber(project.goalAmount, 18) }}
										style={{ width: '100%' }}
										onFinish={(values) => onCompleteBuilding(TokenUtils.toBigInt(values.saleAmount, 18))}
										disabled={disabled}
									>
										<div style={{ width: '100%', display: 'flex' }}>
											<div style={{}}>
												<Form.Item label={'Sale amount'} name={'saleAmount'} rules={[{ required: true }]}>
													<InputNumber min={0} addonAfter={'KLAY'} />
												</Form.Item>
											</div>

											<div style={{ flex: 1 }}>
												<Form.Item style={{ flex: 1, marginRight: 0 }}>
													<Button type={'primary'} htmlType={'submit'}>
														{'Complete building'}
													</Button>
												</Form.Item>
											</div>
										</div>
									</Form>
								) : (
									<Button type={'primary'} disabled={disabled} onClick={onRedeemFee}>
										{'Redeem fee'}
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</Card>
		</Badge.Ribbon>
	);
};
