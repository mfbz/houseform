import Icon from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Result, Spin, theme as ThemeManager } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import {
	HiOutlineCubeTransparent,
	HiOutlineCheckCircle,
	HiOutlineExclamation,
	HiOutlinePhotograph,
	HiOutlinePlusCircle,
	HiOutlineX,
} from 'react-icons/hi';
import { useDebounce } from 'usehooks-ts';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { KlaytnConstants } from '../../../../constants/klaytn';
import { TokenUtils } from '../../../_utils/token-utils';

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
		builderFee: 0,
		totalShares: 0,
		fundraisingDeadline: undefined,
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
						name: '_builderFee',
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
			TokenUtils.toBigInt(debouncedProject.goalAmount, 18),
			debouncedProject.expectedProfit,
			debouncedProject.builderFee,
			debouncedProject.totalShares,
			debouncedProject.fundraisingDeadline?.unix() || 0,
		],
	});
	const { data, write } = useContractWrite(config);
	const { isLoading, isSuccess, isError } = useWaitForTransaction({ hash: data?.hash });

	// Close modal on success or error after short timeout
	useEffect(() => {
		if (isSuccess || isError) {
			const timer = setTimeout(() => hideModal(), 3000);
			return () => clearTimeout(timer);
		}
	}, [isSuccess, isError, hideModal]);

	// Handle project create submission
	const handleSubmit = useCallback(
		async (values: any) => {
			write?.();
		},
		[write],
	);

	// To clear modal when closed
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
				closeIcon={isLoading ? null : <Icon component={() => <HiOutlineX />} />}
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
									label={'Image URL'}
									rules={[{ required: true, message: 'Please input an image url' }]}
									style={{
										marginTop: token.margin,
									}}
								>
									<Input style={{ width: '100%' }} />
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
									label={'Name'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[{ required: true, message: 'Please input a name' }]}
								>
									<Input style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name={'description'}
									label={'Description'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[{ required: true, message: 'Please input a description' }]}
								>
									<Input style={{ width: '100%' }} />
								</Form.Item>

								<Form.Item
									name={'goalAmount'}
									label={'Goal amount'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[{ required: true, message: 'Please input the goal amount' }]}
								>
									<InputNumber style={{ width: '100%' }} suffix={'KLAY'} />
								</Form.Item>

								<Form.Item
									name={'expectedProfit'}
									label={'Expected profit'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[
										{ required: true, message: 'Please input the expected profit' },
										{
											message: 'Only round numbers',
											validator: (_, value) => {
												if (/^\d+$/.test(value)) {
													return Promise.resolve();
												} else {
													return Promise.reject('Only round numbers');
												}
											},
										},
									]}
								>
									<InputNumber style={{ width: '100%' }} suffix={'%'} />
								</Form.Item>

								<Form.Item
									name={'builderFee'}
									label={'Builder fee'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[
										{ required: true, message: "Please input builder's fee" },
										{
											message: 'Only round numbers',
											validator: (_, value) => {
												if (/^\d+$/.test(value)) {
													return Promise.resolve();
												} else {
													return Promise.reject('Only round numbers');
												}
											},
										},
									]}
								>
									<InputNumber style={{ width: '100%' }} suffix={'%'} />
								</Form.Item>

								<Form.Item
									name={'totalShares'}
									label={'Total shares'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[
										{ required: true, message: 'Please input total shares' },
										{
											message: 'Only round numbers',
											validator: (_, value) => {
												if (/^\d+$/.test(value)) {
													return Promise.resolve();
												} else {
													return Promise.reject('Only round numbers');
												}
											},
										},
									]}
								>
									<InputNumber style={{ width: '100%' }} suffix={'shares'} />
								</Form.Item>

								<Form.Item
									name={'fundraisingDeadline'}
									label={'Fundraising deadline'}
									style={{ width: '100%', marginBottom: 8 }}
									rules={[{ required: true, message: 'Please select project fundraising deadline' }]}
								>
									<DatePicker
										style={{ width: '100%' }}
										disabledDate={(d) => !d || d.unix() < Date.now() / 1000 + 1 * 24 * 60 * 60}
									/>
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

							<Form.Item style={{ padding: 0, marginTop: 8, marginBottom: 0 }}>
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
						style={{ paddingTop: token.paddingLG, paddingBottom: token.paddingLG }}
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
						style={{ paddingTop: token.paddingLG, paddingBottom: token.paddingLG }}
					/>
				)}
			</Modal>
		</>
	);
};
