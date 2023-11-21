import Icon from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Result, Spin, theme as ThemeManager } from 'antd';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import {
	HiOutlinePlusCircle,
	HiOutlineExclamation,
	HiOutlineRefresh,
	HiOutlineCheckCircle,
	HiOutlineX,
	HiOutlinePhotograph,
} from 'react-icons/hi';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { KlaytnConstants } from '../../../../constants/klaytn';
import { useDebounce } from 'usehooks-ts';

const RESULT_ICON_SIZE = 64;

export const CreateButton = function CreateButton({ style }: { style?: React.CSSProperties }) {
	// Antd design token
	const { token } = ThemeManager.useToken();

	const [modalOpen, setModalOpen] = useState(false);
	const showModal = useCallback(() => setModalOpen(true), []);
	const hideModal = useCallback(() => setModalOpen(false), []);

	// Form reference
	const [form] = Form.useForm();
	// Current project data
	const [project, setProject] = useState<any>({
		name: '',
		description: '',
		image: '',
		goalAmount: 0,
		expectedProfit: 0,
		builderShares: 0,
		totalShares: 0,
		fundraisingDeadline: 0,
	});
	// Debounce it to avoid spamming public endpoint
	const debouncedProject = useDebounce(project, 500);
	// https://wagmi.sh/examples/contract-write-dynamic
	const { config } = usePrepareContractWrite({
		address: KlaytnConstants.NETWORK_DATA.contracts.HouseformManager.address as any,
		abi: [
			{
				inputs: [
					{
						internalType: 'string',
						name: '_name',
						type: 'string',
					},
					{
						internalType: 'string',
						name: '_description',
						type: 'string',
					},
					{
						internalType: 'string',
						name: '_image',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: '_goalAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: '_expectedProfit',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: '_builderShares',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: '_totalShares',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: '_fundraisingDeadline',
						type: 'uint256',
					},
				],
				name: 'createProject',
				outputs: [],
				stateMutability: 'nonpayable',
				type: 'function',
			},
		],
		functionName: 'createProject',
		args: [
			debouncedProject.name,
			debouncedProject.description,
			debouncedProject.image,
			debouncedProject.goalAmount,
			debouncedProject.expectedProfit,
			debouncedProject.builderShares,
			debouncedProject.totalShares,
			debouncedProject.fundraisingDeadline,
		],
	});
	const { data, write } = useContractWrite(config);
	const { isLoading, isSuccess, isError } = useWaitForTransaction({ hash: data?.hash });

	// Handle project create submission
	const handleSubmit = useCallback(
		async (values: any) => {
			write?.();
		},
		[write],
	);

	const clearModal = useCallback(() => {
		form.resetFields();
	}, [form]);

	return (
		<>
			<Button
				icon={<Icon component={() => <HiOutlinePlusCircle />} />}
				type={'primary'}
				onClick={showModal}
				style={{ ...style }}
			>
				{'Create'}
			</Button>

			<Modal
				title={'Create a project'}
				open={modalOpen}
				footer={null}
				closeIcon={<Icon component={() => <HiOutlineX />} />}
				onCancel={isLoading ? undefined : hideModal}
				width={'60%'}
				centered={true}
				maskClosable={!isLoading}
				afterClose={clearModal}
				style={{ padding: token.paddingLG }}
			>
				{!isLoading && !isSuccess && !isError && (
					<Form
						form={form}
						layout={'vertical'}
						onFinish={handleSubmit}
						onValuesChange={(changedValues, values) =>
							setProject((_project: any) => ({ ..._project, ...changedValues }))
						}
						style={{ width: '100%', marginTop: token.margin }}
					>
						<div style={{ display: 'flex', flexWrap: 'wrap' }}>
							<div
								style={{
									flex: 1,
									minWidth: 400,
									marginRight: token.marginLG,
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<Card
									cover={
										project.image ? (
											<img
												src={project.image}
												alt={'project image'}
												style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 16 }}
											/>
										) : (
											<div
												style={{
													width: '100%',
													height: 300,
													objectFit: 'cover',
													borderRadius: 16,
													background: token.colorBgContainerDisabled,
													display: 'flex',
													justifyContent: 'center',
													alignItems: 'center',
												}}
											>
												<Icon
													style={{ fontSize: RESULT_ICON_SIZE, color: token.colorPrimary }}
													component={(props: any) => <HiOutlinePhotograph {...props} fill={'none'} />}
												/>
											</div>
										)
									}
									bodyStyle={{ padding: 0 }}
								/>

								<Form.Item
									name={'image'}
									rules={[{ required: true, message: 'Please input an image url' }]}
									style={{
										marginTop: token.margin,
									}}
								>
									<Input style={{ width: '100%' }} placeholder={'Image url'} />
								</Form.Item>
							</div>

							<div
								style={{
									flex: 1,
									minWidth: 150,
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<Form.Item
									name={'name'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please input a name' }]}
								>
									<Input size={'large'} style={{ width: '100%' }} placeholder={'Name'} />
								</Form.Item>

								<Form.Item
									name={'description'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please input a description' }]}
								>
									<Input style={{ width: '100%' }} placeholder={'Description'} />
								</Form.Item>

								<Form.Item
									name={'goalAmount'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please input the goal amount' }]}
								>
									<InputNumber style={{ width: '100%' }} placeholder={'Goal amount'} />
								</Form.Item>

								<Form.Item
									name={'expectedProfit'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please input the expected profit' }]}
								>
									<InputNumber style={{ width: '100%' }} placeholder={'Expected profit'} suffix={'%'} />
								</Form.Item>

								<Form.Item
									name={'builderShares'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: "Please input builder's shares" }]}
								>
									<InputNumber style={{ width: '100%' }} placeholder={'Builder shares'} />
								</Form.Item>

								<Form.Item
									name={'totalShares'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please input total shares' }]}
								>
									<InputNumber style={{ width: '100%' }} placeholder={'Total shares'} />
								</Form.Item>

								<Form.Item
									name={'fundraisingDeadline'}
									style={{ width: '100%' }}
									rules={[{ required: true, message: 'Please select project fundraising deadline' }]}
								>
									<DatePicker style={{ width: '100%' }} placeholder={'Fundraising deadline'} />
								</Form.Item>
							</div>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<div></div>

							<Form.Item style={{ padding: 0, margin: 0 }}>
								<Button type={'primary'} htmlType={'submit'} disabled={!write}>
									{'Create'}
								</Button>
							</Form.Item>
						</div>
					</Form>
				)}

				{isLoading && (
					<Result
						icon={
							<Spin
								indicator={
									<Icon
										style={{ fontSize: RESULT_ICON_SIZE }}
										component={(props: any) => <HiOutlineRefresh {...props} fill={'none'} />}
										spin={true}
									/>
								}
							/>
						}
						title={'Creating your project...'}
					/>
				)}

				{isSuccess && (
					<Result
						icon={
							<Icon
								style={{ fontSize: RESULT_ICON_SIZE, color: token.colorSuccess }}
								component={(props: any) => <HiOutlineCheckCircle {...props} fill={'none'} />}
							/>
						}
						title={'Your project has been created'}
					/>
				)}

				{isError && (
					<Result
						icon={
							<Icon
								style={{ fontSize: RESULT_ICON_SIZE, color: token.colorError }}
								component={(props: any) => <HiOutlineExclamation {...props} fill={'none'} />}
							/>
						}
						title={'An error occurred while creating your project'}
					/>
				)}
			</Modal>
		</>
	);
};
