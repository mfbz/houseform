'use client';

import {
	Avatar,
	Badge,
	Button,
	Card,
	Col,
	Form,
	InputNumber,
	Modal,
	Progress,
	Result,
	Row,
	Spin,
	Statistic,
	theme as ThemeManager,
	Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useContractReads, useWalletClient } from 'wagmi';
import { getPublicClient, waitForTransaction } from 'wagmi/actions';
import { KlaytnConstants } from '../../../constants/klaytn';
import { Metadata } from '../../_interfaces/metadata';
import { TokenUtils } from '../../_utils/token-utils';
import { TypeMapper } from '../../_utils/type-mapper';
import { ProjectUtils } from '../../_utils/project-utils';
import Icon from '@ant-design/icons';
import { HiOutlineIdentification, HiOutlineCubeTransparent } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

const RESULT_ICON_SIZE = 64;

export default function ProjectPage({ params }: { params: { projectId: bigint } }) {
	const router = useRouter();
	const { token } = ThemeManager.useToken();

	const projectId = useMemo(() => {
		return params.projectId;
	}, [params]);

	const { data, isError, isLoading, refetch } = useContractReads({
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
										internalType: 'uint256',
										name: 'projectId',
										type: 'uint256',
									},
									{
										internalType: 'address',
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
				args: [projectId],
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
				args: [projectId],
			},
		],
	});

	// Convert project adhering interface
	const project = useMemo(() => {
		if (!data) return null;
		return TypeMapper.toProject(data[0].result as any);
	}, [data]);

	// Get project state
	const projectState = useMemo(() => {
		if (!project) return null;
		return ProjectUtils.getProjetState(project);
	}, [project]);

	// Handle metadata
	const [metadata, setMetadata] = useState<Metadata | null>(null);
	useEffect(() => {
		const fetchMetadata = async () => {
			if (!data) return;
			const result = await fetch(data[1].result as any);
			const _metadata = await result.json();
			setMetadata(_metadata);
		};

		fetchMetadata();
	}, [data]);

	// To handle buy shares loading modal
	const [loadingModal, loadingModalContextHolder] = Modal.useModal();

	// Get wallet client to do transactions
	const { data: walletClient } = useWalletClient();
	// Execute share buy
	const onBuyShares = useCallback(
		async (projectId: bigint, shares: number, amount: bigint) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				const instance = loadingModal.success({
					icon: null,
					title: 'Buying ' + shares + (shares > 1 ? ' shares ...' : ' share ...'),
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
					args: [projectId, TokenUtils.toBigInt(shares, 0)],
					value: amount,
				});

				// If we are here it means no error has been thrown so continue and execute the transaction
				const hash = await walletClient.writeContract(request);
				// Wait for transaction to be confirmed
				const receipt = await waitForTransaction({ hash });
				console.log(receipt);

				// Refetch projects to update data
				await refetch();

				instance.destroy();
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient, loadingModal, token, refetch],
	);

	// Calculate share cost
	const shareCost = useMemo(() => {
		if (!project) return null;
		return project.goalAmount / BigInt(project.totalShares);
	}, [project]);

	// Get connected user if any
	const { address, isConnecting, isConnected, isDisconnected } = useAccount();
	// Get if connected user is builder
	const isBuilder = useMemo(() => {
		if (!isConnected || !address || !project) return false;
		return project.builder === address;
	}, [address, isConnected, project]);

	if (!project || !projectState || !metadata || !shareCost) return null;
	return (
		<main>
			{loadingModalContextHolder}
			<Row gutter={token.margin} style={{}}>
				<Col span={16}>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<Card
							cover={
								<div style={{ width: '100%', padding: token.margin }}>
									<img src={metadata?.image} width={'100%'} style={{ borderRadius: token.borderRadius }} />
								</div>
							}
							bodyStyle={{ paddingTop: 0 }}
						>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
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

									<Typography.Text style={{ margin: 0, fontSize: '0.9em' }}>{'#' + project.projectId}</Typography.Text>
								</div>

								<Typography.Title level={5} style={{ marginTop: token.margin }}>
									{metadata?.name}
								</Typography.Title>

								<Typography.Text style={{ overflow: 'hidden' }}>{metadata?.description}</Typography.Text>
							</div>
						</Card>
					</div>
				</Col>

				<Col span={8}>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<Card bodyStyle={{ paddingTop: 8 }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<div style={{ display: 'flex', marginTop: token.margin }}>
									<Badge
										text={projectState ? ProjectUtils.getProjetStateData(projectState)[0] : undefined}
										color={projectState ? ProjectUtils.getProjetStateData(projectState)[1] : undefined}
									/>
								</div>

								<Statistic
									title={'Available shares'}
									value={project.totalShares - project.currentShares}
									suffix={'/ ' + project.totalShares}
									style={{ marginTop: token.margin }}
								/>

								<Statistic
									title={'Expected profit'}
									value={project.expectedProfit}
									valueStyle={{ color: '#3f8600' }}
									suffix={'%'}
									style={{ marginTop: token.margin }}
								/>

								<div style={{ display: 'flex', flexDirection: 'column' }}>
									<Statistic
										title={'Current amount'}
										value={TokenUtils.toNumber(project.currentAmount, 18)}
										suffix={' / ' + TokenUtils.toNumber(project.goalAmount, 18) + ' KLAY'}
										style={{ marginTop: token.margin }}
									/>

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
							</div>
						</Card>

						<Card bodyStyle={{}} style={{ marginTop: token.margin }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<Form
									layout={'inline'}
									initialValues={{ shares: 1 }}
									style={{ width: '100%' }}
									onFinish={(values) => onBuyShares(params.projectId, values.shares, BigInt(values.shares) * shareCost)}
									disabled={!isConnected || projectState !== 'fundraising'}
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

								{projectState === 'fundraising' && (
									<Typography.Text type={'secondary'} style={{ marginTop: token.margin }}>
										{'Fundraising ends on ' +
											new Date(project.fundraisingDeadline * 1000).toLocaleDateString('en-us', {
												day: 'numeric',
												month: 'short',
											})}
									</Typography.Text>
								)}
							</div>
						</Card>
					</div>
				</Col>
			</Row>
		</main>
	);
}
