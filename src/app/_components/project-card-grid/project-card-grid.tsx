'use client';

import Icon from '@ant-design/icons';
import { List, Modal, Result, Spin, theme as ThemeManager } from 'antd';
import React, { useCallback } from 'react';
import { HiCubeTransparent } from 'react-icons/hi';
import { Project } from '../../_interfaces/project';
import { ProjectCard } from './components/project-card';
import { Metadata } from '../../_interfaces/metadata';

const RESULT_ICON_SIZE = 64;

export const ProjectCardGrid = function ProjectCardGrid({
	projects,
	onItemClick,
	onGetMetadata,
	onBuyShares,
}: {
	projects: Project[];
	onItemClick: (projectId: number) => void;
	onGetMetadata: (projectId: number) => Promise<Metadata | null> | Metadata | null;
	onBuyShares: (projectId: number, shares: number, amount: bigint) => Promise<void> | void;
}) {
	const { token } = ThemeManager.useToken();

	// To handle buy shares loading modal
	const [loadingModal, loadingModalContextHolder] = Modal.useModal();
	// To handle buying shares for a project
	const onBuySharesWrapper = useCallback(
		async (projectId: number, shares: number, amount: bigint) => {
			const instance = loadingModal.success({
				icon: null,
				title: 'Buying ' + shares + ' shares...',
				content: (
					<Result
						icon={
							<Spin
								indicator={
									<Icon
										style={{ fontSize: RESULT_ICON_SIZE }}
										component={(props: any) => <HiCubeTransparent {...props} fill={'none'} />}
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

			await onBuyShares(projectId, shares, amount);
			instance.destroy();
		},
		[loadingModal, token, onBuyShares],
	);

	return (
		<>
			{loadingModalContextHolder}
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<List
					grid={{ gutter: token.margin, column: 3 }}
					dataSource={projects}
					renderItem={(item, index) => (
						<List.Item>
							<ProjectCard
								id={index}
								project={item}
								onClick={() => onItemClick(index)}
								onGetMetadata={async () => await onGetMetadata(index)}
								onBuyShares={async (shares, amount) => await onBuySharesWrapper(index, shares, amount)}
							/>
						</List.Item>
					)}
				/>
			</div>
		</>
	);
};
