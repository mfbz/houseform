export interface Project {
	projectId: bigint;
	builder: string;
	currentAmount: bigint;
	goalAmount: bigint;
	saleAmount: bigint;
	expectedProfit: number;
	builderFee: number;
	currentShares: number;
	totalShares: number;
	fundraisingDeadline: number;
	fundraisingCompletedOn: number;
	buildingStartedOn: number;
	buildingCompletedOn: number;
}

export type ProjectState = 'fundraising' | 'expired' | 'preparing' | 'started' | 'completed';
