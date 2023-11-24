import { Project } from '../_interfaces/project';
import { TokenUtils } from './token-utils';

export class TypeMapper {
	public static toProject(item: any) {
		return {
			projectId: item.projectId,
			builder: item.builder,
			currentAmount: item.currentAmount,
			goalAmount: item.goalAmount,
			saleAmount: item.saleAmount,
			expectedProfit: TokenUtils.toNumber(item.expectedProfit, 0),
			builderFee: TokenUtils.toNumber(item.builderFee, 0),
			currentShares: TokenUtils.toNumber(item.currentShares, 0),
			totalShares: TokenUtils.toNumber(item.totalShares, 0),
			fundraisingDeadline: TokenUtils.toNumber(item.fundraisingDeadline, 0),
			fundraisingCompletedOn: TokenUtils.toNumber(item.fundraisingCompletedOn, 0),
			buildingStartedOn: TokenUtils.toNumber(item.buildingStartedOn, 0),
			buildingCompletedOn: TokenUtils.toNumber(item.buildingCompletedOn, 0),
		} as Project;
	}
}
