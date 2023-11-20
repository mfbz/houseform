import Icon from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Result, Spin, theme as ThemeManager } from 'antd';
import Link from 'next/link';
import React, { useCallback, useState } from 'react';
import {
	HiOutlinePlusCircle,
	HiOutlineExclamation,
	HiOutlineRefresh,
	HiOutlineCheckCircle,
	HiOutlineX,
	HiOutlinePhotograph,
} from 'react-icons/hi';

const RESULT_ICON_SIZE = 64;

export const CreateButton = function CreateButton({ style }: { style?: React.CSSProperties }) {
	// Antd design token
	const { token } = ThemeManager.useToken();

	const [modalOpen, setModalOpen] = useState(false);
	const showModal = useCallback(() => setModalOpen(true), []);
	const hideModal = useCallback(() => setModalOpen(false), []);

	const [form] = Form.useForm();
	const [image, setImage] = useState('');
	const [submitLoading, setSubmitLoading] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState(false);
	const [projectCreated, setProjectCreated] = useState<any | null>(null);

	const handleSubmit = useCallback(async (values: any) => {
		// TODO
	}, []);

	const clearSubmit = useCallback(() => {
		setSubmitLoading(false);
		setSubmitSuccess(false);
		setSubmitError(false);
		setProjectCreated(null);
	}, []);

	const clearModal = useCallback(() => {
		clearSubmit();
		form.resetFields();
	}, [form, clearSubmit]);

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
				onCancel={submitLoading ? undefined : hideModal}
				width={'60%'}
				centered={true}
				maskClosable={!submitLoading}
				afterClose={clearModal}
				style={{ padding: token.paddingLG }}
			>
				{!submitLoading && !submitSuccess && !submitError && (
					<Form
						form={form}
						layout={'vertical'}
						onFinish={handleSubmit}
						onValuesChange={(changedValues, values) => setImage(values.image || '')}
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
										image ? (
											<img
												src={image}
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
								<Button type={'primary'} htmlType={'submit'}>
									{'Create'}
								</Button>
							</Form.Item>
						</div>
					</Form>
				)}

				{submitLoading && (
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

				{submitSuccess && (
					<Result
						icon={
							<Icon
								style={{ fontSize: RESULT_ICON_SIZE, color: token.colorSuccess }}
								component={(props: any) => <HiOutlineCheckCircle {...props} fill={'none'} />}
							/>
						}
						title={'Your project has been created'}
						extra={[
							<Link key={'view'} href={'/projects/' + projectCreated?.id}>
								<Button type={'primary'} onClick={hideModal}>
									{'View'}
								</Button>
							</Link>,
							<Button key={'continue'} onClick={hideModal}>
								{'Continue browsing'}
							</Button>,
						]}
					/>
				)}

				{submitError && (
					<Result
						icon={
							<Icon
								style={{ fontSize: RESULT_ICON_SIZE, color: token.colorError }}
								component={(props: any) => <HiOutlineExclamation {...props} fill={'none'} />}
							/>
						}
						title={'An error occurred while creating your project'}
						extra={[
							<Button key={'again'} type={'primary'} onClick={clearSubmit}>
								{'Try again'}
							</Button>,
							<Button key={'continue'} onClick={hideModal}>
								{'Continue browsing'}
							</Button>,
						]}
					/>
				)}
			</Modal>
		</>
	);
};
