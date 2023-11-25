'use client';

import { Card, theme as ThemeManager, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useContractRead, useWalletClient } from 'wagmi';
import { getPublicClient, waitForTransaction } from 'wagmi/actions';
import { KlaytnConstants } from '../../../constants/klaytn';
import { InvestmentCardList } from '../../_components/investment-card-list';
import { Investment } from '../../_interfaces/investment';
import { TokenUtils } from '../../_utils/token-utils';
import { TypeMapper } from '../../_utils/type-mapper';
import { BuildingCardList } from '../../_components/building-card-list';
import { useRouter } from 'next/navigation';

export default function UserPage({ params }: { params: { address: string } }) {
	const { token } = ThemeManager.useToken();

	// Get connected user if any
	const { address: accountAddress, isConnecting, isConnected, isDisconnected } = useAccount();
	// Get if connected user is owner of page
	const isOwner = useMemo(() => {
		if (!isConnected || !accountAddress) return false;
		return params.address === accountAddress;
	}, [params, accountAddress, isConnected]);

	// Projects data
	const { data: projectsData, refetch: refetchProjects } = useContractRead({
		address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
		abi: [
			{
				inputs: [],
				name: 'getProjects',
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
						internalType: 'struct HouseformManager.Project[]',
						name: '',
						type: 'tuple[]',
					},
				],
				stateMutability: 'view',
				type: 'function',
			},
		],
		functionName: 'getProjects',
	});
	// Convert projects adhering interface
	const projects = useMemo(() => {
		if (!projectsData) return [];
		return (projectsData as any[])
			.map((item: any) => TypeMapper.toProject(item))
			.sort((a, b) => TokenUtils.toNumber(b.projectId - a.projectId, 0));
	}, [projectsData]);

	// Get balance of shares for project
	const onGetBalanceOf = useCallback(async (address: string, projectId: bigint) => {
		try {
			return await getPublicClient().readContract({
				address: KlaytnConstants.NETWORK_DATA.contracts.HouseformShare.address as any,
				abi: [
					{
						inputs: [
							{
								internalType: 'address',
								name: 'owner',
								type: 'address',
							},
							{
								internalType: 'uint256',
								name: 'id',
								type: 'uint256',
							},
						],
						name: 'balanceOf',
						outputs: [
							{
								internalType: 'uint256',
								name: '',
								type: 'uint256',
							},
						],
						stateMutability: 'view',
						type: 'function',
					},
				],
				functionName: 'balanceOf',
				args: [address as any, projectId],
			});
		} catch (error) {
			return null;
		}
	}, []);

	// Calculated investments
	const [investments, setInvestments] = useState<Investment[]>([]);
	// Calculate based on projects
	useEffect(() => {
		const fetchInvestments = async () => {
			const _investments: Investment[] = [];
			for (let i = 0; i < projects.length; i++) {
				const project = projects[i];
				const shares = await onGetBalanceOf(params.address, project.projectId);
				if (shares) {
					_investments.push({ project, shares: TokenUtils.toNumber(shares, 0) });
				}
			}
			setInvestments(_investments);
		};

		fetchInvestments();
	}, [params, projects, onGetBalanceOf]);

	// Builder projects data
	const { data: builderProjectsData, refetch: refetchBuilderProjects } = useContractRead({
		address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
		abi: [
			{
				inputs: [
					{
						internalType: 'address',
						name: '_builder',
						type: 'address',
					},
				],
				name: 'getBuilderProjects',
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
						internalType: 'struct HouseformManager.Project[]',
						name: '',
						type: 'tuple[]',
					},
				],
				stateMutability: 'view',
				type: 'function',
			},
		],
		functionName: 'getBuilderProjects',
		args: [params.address as any],
	});
	// Convert projects adhering interface
	const builderProjects = useMemo(() => {
		if (!builderProjectsData) return [];
		return (builderProjectsData as any[])
			.map((item: any) => TypeMapper.toProject(item))
			.sort((a, b) => TokenUtils.toNumber(b.projectId - a.projectId, 0));
	}, [builderProjectsData]);

	// Get metadata from share contract uri
	const onGetMetadata = useCallback(async (projectId: bigint) => {
		try {
			const uri = await getPublicClient().readContract({
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
			});

			const result = await fetch(uri);
			return await result.json();
		} catch (error) {
			return null;
		}
	}, []);

	// Get wallet client to do transactions
	const { data: walletClient } = useWalletClient();
	// Execute share redeem
	const onRedeemShares = useCallback(
		async (projectId: bigint, shares: number) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				// GET IF ALREADY APPROVED TO AVOID 1 CALL
				const approved = await getPublicClient().readContract({
					address: KlaytnConstants.NETWORK_DATA.contracts.HouseformShare.address as any,
					abi: [
						{
							inputs: [
								{
									internalType: 'address',
									name: 'owner',
									type: 'address',
								},
								{
									internalType: 'address',
									name: 'operator',
									type: 'address',
								},
							],
							name: 'isApprovedForAll',
							outputs: [
								{
									internalType: 'bool',
									name: '',
									type: 'bool',
								},
							],
							stateMutability: 'view',
							type: 'function',
						},
					],
					functionName: 'isApprovedForAll',
					args: [walletClient.account.address, KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any],
				});

				// GIVE APPROVAL TO CONTRACT (only if not already done)
				if (!approved) {
					// Execute write with simulate to validate transaction
					const { request: setApprovalRequest } = await getPublicClient().simulateContract({
						account: walletClient.account.address,
						address: KlaytnConstants.NETWORK_DATA.contracts.HouseformShare.address as any,
						abi: [
							{
								inputs: [
									{
										internalType: 'address',
										name: 'operator',
										type: 'address',
									},
									{
										internalType: 'bool',
										name: 'approved',
										type: 'bool',
									},
								],
								name: 'setApprovalForAll',
								outputs: [],
								stateMutability: 'nonpayable',
								type: 'function',
							},
						],
						functionName: 'setApprovalForAll',
						args: [KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any, true],
					});
					// If we are here it means no error has been thrown so continue and execute the transaction
					const setApprovalHash = await walletClient.writeContract(setApprovalRequest);
					// Wait for transaction to be confirmed
					const setApprovalReceipt = await waitForTransaction({ hash: setApprovalHash });
					console.log(setApprovalReceipt);
				}

				// EXECUTE REDEEM SHARE
				// Execute write with simulate to validate transaction
				const { request: redeemSharesRequest } = await getPublicClient().simulateContract({
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
							name: 'redeemShares',
							outputs: [],
							stateMutability: 'nonpayable',
							type: 'function',
						},
					],
					functionName: 'redeemShares',
					args: [projectId, TokenUtils.toBigInt(shares, 0)],
				});
				// If we are here it means no error has been thrown so continue and execute the transaction
				const reedemSharesHash = await walletClient.writeContract(redeemSharesRequest);
				// Wait for transaction to be confirmed
				const reedemSharesReceipt = await waitForTransaction({ hash: reedemSharesHash });
				console.log(reedemSharesReceipt);

				// Refetch projects to update data
				await refetchProjects();
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient, refetchProjects],
	);

	// Execute other buildings actions
	const onStartBuilding = useCallback(
		async (projectId: bigint) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				// Execute write with simulate to validate transaction
				const { request: startBuildingRequest } = await getPublicClient().simulateContract({
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
							],
							name: 'startBuilding',
							outputs: [],
							stateMutability: 'nonpayable',
							type: 'function',
						},
					],
					functionName: 'startBuilding',
					args: [projectId],
				});
				// If we are here it means no error has been thrown so continue and execute the transaction
				const startBuildingHash = await walletClient.writeContract(startBuildingRequest);
				// Wait for transaction to be confirmed
				const startBuildingReceipt = await waitForTransaction({ hash: startBuildingHash });
				console.log(startBuildingReceipt);

				// Refetch projects to update data
				await refetchBuilderProjects();
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient, refetchBuilderProjects],
	);
	const onCompleteBuilding = useCallback(
		async (projectId: bigint, saleAmount: bigint) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				// Execute write with simulate to validate transaction
				const { request: completeBuildingRequest } = await getPublicClient().simulateContract({
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
							],
							name: 'completeBuilding',
							outputs: [],
							stateMutability: 'payable',
							type: 'function',
						},
					],
					functionName: 'completeBuilding',
					args: [projectId],
					value: saleAmount,
				});
				// If we are here it means no error has been thrown so continue and execute the transaction
				const completeBuildingHash = await walletClient.writeContract(completeBuildingRequest);
				// Wait for transaction to be confirmed
				const completeBuildingReceipt = await waitForTransaction({ hash: completeBuildingHash });
				console.log(completeBuildingReceipt);

				// Refetch projects to update data
				await refetchBuilderProjects();
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient, refetchBuilderProjects],
	);
	const onRedeemFee = useCallback(
		async (projectId: bigint) => {
			try {
				// Validate it exists
				if (!walletClient) throw new Error();

				// Execute write with simulate to validate transaction
				const { request: redeemFeeRequest } = await getPublicClient().simulateContract({
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
							],
							name: 'redeemFee',
							outputs: [],
							stateMutability: 'nonpayable',
							type: 'function',
						},
					],
					functionName: 'redeemFee',
					args: [projectId],
				});
				// If we are here it means no error has been thrown so continue and execute the transaction
				const redeemFeeHash = await walletClient.writeContract(redeemFeeRequest);
				// Wait for transaction to be confirmed
				const redeemFeeReceipt = await waitForTransaction({ hash: redeemFeeHash });
				console.log(redeemFeeReceipt);
			} catch (error) {
				// hehe
				console.log(error);
			}
		},
		[walletClient],
	);

	// To navigate to other pages
	const router = useRouter();
	// Handle item click
	const onItemClick = useCallback(
		(projectId: bigint) => {
			router.push('/projects/' + projectId);
		},
		[router],
	);

	return (
		<main>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{}}>
					<Card>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<Typography.Text type={'secondary'}>{'User'}</Typography.Text>

							<Typography.Title level={5} style={{ marginTop: 0 }}>
								{params.address}
							</Typography.Title>
						</div>
					</Card>
				</div>

				<div style={{ marginTop: token.marginLG }}>
					<Typography.Title level={4} style={{ marginTop: 0 }}>
						{'Investments' + ' (' + investments.length + ')'}
					</Typography.Title>

					<div style={{ marginTop: token.margin }}>
						<InvestmentCardList
							investments={investments}
							showActions={isOwner && isConnected}
							disabled={!isConnected}
							onItemClick={onItemClick}
							onGetMetadata={onGetMetadata}
							onRedeemShares={onRedeemShares}
						/>
					</div>
				</div>

				<div style={{ marginTop: token.marginLG }}>
					<Typography.Title level={4} style={{ marginTop: 0 }}>
						{'Projects' + ' (' + builderProjects.length + ')'}
					</Typography.Title>

					<div style={{ marginTop: token.margin }}>
						<BuildingCardList
							projects={builderProjects}
							showActions={isOwner && isConnected}
							disabled={!isConnected}
							onItemClick={onItemClick}
							onGetMetadata={onGetMetadata}
							onStartBuilding={onStartBuilding}
							onCompleteBuilding={onCompleteBuilding}
							onRedeemFee={onRedeemFee}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
