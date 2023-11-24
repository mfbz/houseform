'use client';

import {
	Badge,
	Button,
	Card,
	Col,
	Form,
	InputNumber,
	Progress,
	Row,
	Statistic,
	theme as ThemeManager,
	Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { KlaytnConstants } from '../../../../constants/klaytn';
import { Metadata } from '../../../_interfaces/metadata';
import { Project } from '../../../_interfaces/project';
import { TokenUtils } from '../../../_utils/token-utils';
import { ProjectUtils } from '../../../_utils/project-utils';

export const ProjectCard = function ProjectCard({
	id,
	project,
	disabled,
	onClick,
	onGetMetadata,
	onBuyShares,
}: {
	id: number;
	project: Project;
	disabled?: boolean;
	onClick: () => void;
	onGetMetadata: () => Promise<Metadata | null> | Metadata | null;
	onBuyShares: (shares: number, amount: bigint) => Promise<void> | void;
}) {
	const { address, isConnecting, isConnected, isDisconnected } = useAccount();

	const { token } = ThemeManager.useToken();

	// Get project state
	const projectState = useMemo(() => {
		if (!project) return null;
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

	return (
		<Badge.Ribbon
			text={projectState ? ProjectUtils.getProjetStateData(projectState)[0] : undefined}
			color={projectState ? ProjectUtils.getProjetStateData(projectState)[1] : undefined}
		>
			<Card
				cover={
					<div onClick={onClick} style={{ width: '100%', padding: token.margin, cursor: 'pointer' }}>
						<img src={metadata?.image} width={'100%'} height={300} style={{ borderRadius: token.borderRadius }} />
					</div>
				}
				bodyStyle={{ paddingTop: 0 }}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography.Title level={5} style={{ marginTop: 0 }}>
						{metadata?.name}
					</Typography.Title>

					<Typography.Text style={{ height: 60, overflow: 'hidden' }}>{metadata?.description}</Typography.Text>

					<Row gutter={token.margin} style={{ height: 120, marginTop: token.margin }}>
						<Col span={12}>
							<Statistic
								title={'Available shares'}
								value={project.totalShares - project.currentShares}
								suffix={'/ ' + project.totalShares}
							/>
						</Col>
						<Col span={12}>
							<Statistic
								title={'Expected profit'}
								value={project.expectedProfit}
								valueStyle={{ color: '#3f8600' }}
								suffix={'%'}
							/>
						</Col>
					</Row>

					<div style={{ display: 'flex', flexDirection: 'column', marginTop: token.margin }}>
						<Typography.Text strong={true}>
							{TokenUtils.toNumber(project.currentAmount, 18) +
								' / ' +
								TokenUtils.toNumber(project.goalAmount, 18) +
								' KLAY'}
						</Typography.Text>

						<Progress percent={(project.currentShares / project.totalShares) * 100} size={'small'} showInfo={false} />
					</div>

					<Typography.Text type={'secondary'}>
						{'1 share = ' +
							Math.round(TokenUtils.toNumber(shareCost, 18)) +
							' KLAY (~' +
							Math.round(
								(KlaytnConstants.NETWORK_DATA.general.klaytnPrice * TokenUtils.toNumber(project.goalAmount, 18)) /
									project.totalShares,
							) +
							' USD)'}
					</Typography.Text>

					<div style={{ display: 'flex', marginTop: token.marginLG, alignItems: 'center' }}>
						<Form
							layout={'inline'}
							initialValues={{ shares: 1 }}
							style={{ width: '100%' }}
							onFinish={(values) => onBuyShares(values.shares, BigInt(values.shares) * shareCost)}
							disabled={disabled || projectState !== 'fundraising'}
						>
							<div style={{ width: '100%', display: 'flex' }}>
								<div style={{}}>
									<Form.Item name={'shares'} rules={[{ required: true }]}>
										<InputNumber min={1} max={project.totalShares - project.currentShares} addonAfter={'Shares'} />
									</Form.Item>
								</div>

								<div style={{ flex: 1 }}>
									<Form.Item style={{ flex: 1, marginRight: 0 }}>
										<Button type={'primary'} htmlType={'submit'} block={true}>
											{'Buy'}
										</Button>
									</Form.Item>
								</div>
							</div>
						</Form>
					</div>
				</div>
			</Card>
		</Badge.Ribbon>
	);
};
