'use client';

import {
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useContractReads, useWalletClient } from 'wagmi';
import { getPublicClient, waitForTransaction } from 'wagmi/actions';
import { KlaytnConstants } from '../../../constants/klaytn';
import { Metadata } from '../../_interfaces/metadata';
import { TokenUtils } from '../../_utils/token-utils';
import { TypeMapper } from '../../_utils/type-mapper';

export default function ProjectPage({ params }: { params: { projectId: number } }) {
	const { token } = ThemeManager.useToken();

	const { data, isError, isLoading } = useContractReads({
		contracts: [
			{
				address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
				abi: [
					{
						inputs: [
							{
								internalType: 'uint256',
								name: '_projectId',
								type: 'uint256',
							},
						],
						name: 'getProject',
						outputs: [
							{
								components: [
									{
										internalType: 'address payable',
										name: 'builder',
										type: 'address',
									},
									{
										internalType: 'uint256',
										name: 'currentAmount',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'goalAmount',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'saleAmount',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'expectedProfit',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'builderFee',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'currentShares',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'totalShares',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'fundraisingDeadline',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'fundraisingCompletedOn',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'buildingStartedOn',
										type: 'uint256',
									},
									{
										internalType: 'uint256',
										name: 'buildingCompletedOn',
										type: 'uint256',
									},
								],
								internalType: 'struct HouseformManager.Project',
								name: '',
								type: 'tuple',
							},
						],
						stateMutability: 'view',
						type: 'function',
					},
				],
				functionName: 'getProject',
			},
			{
				address: KlaytnConstants.NETWORK_DATA.contracts.HouseformShare.address as any,
				abi: [
					{
						inputs: [
							{
								internalType: 'uint256',
								name: '_id',
								type: 'uint256',
							},
						],
						name: 'uri',
						outputs: [
							{
								internalType: 'string',
								name: '',
								type: 'string',
							},
						],
						stateMutability: 'view',
						type: 'function',
					},
				],
				functionName: 'uri',
				args: [TokenUtils.toBigInt(params.projectId, 0)],
			},
		],
	});

	// Convert project adhering interface
	const project = useMemo(() => {
		if (!data) return null;
		return TypeMapper.toProject(data[0] as any);
	}, [data]);

	// Handle metadata
	const [metadata, setMetadata] = useState<Metadata | null>(null);
	useEffect(() => {
		const fetchMetadata = async () => {
			if (!data) return;
			const result = await fetch(data[1] as any);
			const _metadata = await result.json();
			setMetadata(_metadata);
		};

		fetchMetadata();
	}, [data]);

	// Get wallet client to do transactions
	const { data: walletClient } = useWalletClient();
	// Execute share buy
	const onBuyShares = useCallback(
		async (projectId: number, shares: number, amount: bigint) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				// Execute write with simulate to validate transaction
				const { request } = await getPublicClient().simulateContract({
					account: walletClient.account.address,
					address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
					abi: [
						{
							inputs: [
								{
									internalType: 'uint256',
									name: '_projectId',
									type: 'uint256',
								},
								{
									internalType: 'uint256',
									name: '_shares',
									type: 'uint256',
								},
							],
							name: 'buyShares',
							outputs: [],
							stateMutability: 'payable',
							type: 'function',
						},
					],
					functionName: 'buyShares',
					args: [TokenUtils.toBigInt(projectId, 0), TokenUtils.toBigInt(shares, 0)],
					value: amount,
				});

				// If we are here it means no error has been thrown so continue and execute the transaction
				const hash = await walletClient.writeContract(request);
				// Wait for transaction to be confirmed
				const receipt = await waitForTransaction({ hash });
				console.log(receipt);
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient],
	);

	const shareCost = useMemo(() => {
		if (!project) return null;
		return project.goalAmount / BigInt(project.totalShares);
	}, [project]);

	if (!project || !metadata || !shareCost) return null;
	return (
		<main>
			<Row gutter={token.margin} style={{ marginTop: token.margin }}>
				<Col span={16}>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<Card
							cover={
								<div style={{ width: '100%', padding: token.margin }}>
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
							</div>
						</Card>
					</div>
				</Col>

				<Col span={8}>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<Card bodyStyle={{ paddingTop: 0 }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<Row gutter={token.margin} style={{ marginTop: token.margin }}>
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

									<Progress
										percent={(project.currentShares / project.totalShares) * 100}
										size={'default'}
										showInfo={false}
									/>
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
										onFinish={(values) =>
											onBuyShares(params.projectId, values.shares, BigInt(values.shares) * shareCost)
										}
									>
										<div style={{ width: '100%', display: 'flex' }}>
											<div style={{}}>
												<Form.Item name={'shares'} rules={[{ required: true }]}>
													<InputNumber
														min={1}
														max={project.totalShares - project.currentShares}
														addonAfter={'Shares'}
													/>
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

								<Typography.Text type={'secondary'}>
									{'Fundraising ends on ' +
										new Date(project.fundraisingDeadline * 1000).toLocaleDateString('en-us', {
											day: 'numeric',
											month: 'short',
										})}
								</Typography.Text>
							</div>
						</Card>
					</div>
				</Col>
			</Row>
		</main>
	);
}
