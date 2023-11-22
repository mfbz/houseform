'use client';

import { useCallback, useMemo } from 'react';
import { useContractRead, useWalletClient } from 'wagmi';
import { getPublicClient, getWalletClient, waitForTransaction } from 'wagmi/actions';
import { KlaytnConstants } from '../constants/klaytn';
import { ProjectCardGrid } from './_components/project-card-grid';
import { TokenUtils } from './_utils/token-utils';
import { TypeMapper } from './_utils/type-mapper';
import { useRouter } from 'next/navigation';

export default function HomePage() {
	const { data, isError, isLoading } = useContractRead({
		address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
		abi: [
			{
				inputs: [],
				name: 'getProjects',
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
		if (!data) return [];
		return (data as any[]).map((item: any) => TypeMapper.toProject(item));
	}, [data]);

	// To navigate to other pages
	const router = useRouter();
	// Handle item click
	const onItemClick = useCallback(
		(projectId: number) => {
			router.push('/projects/' + projectId);
		},
		[router],
	);

	// Get metadata from share contract uri
	const onGetMetadata = useCallback(async (projectId: number) => {
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
				args: [TokenUtils.toBigInt(projectId, 0)],
			});

			const result = await fetch(uri);
			return await result.json();
		} catch (error) {
			return null;
		}
	}, []);

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

	return (
		<main>
			<div>
				<ProjectCardGrid
					projects={projects}
					onItemClick={onItemClick}
					onGetMetadata={onGetMetadata}
					onBuyShares={onBuyShares}
				/>
			</div>
		</main>
	);
}
