export interface Project {
	builder: string;
	currentAmount: bigint;
	goalAmount: bigint;
	saleAmount: bigint;
	expectedProfit: number;
	currentShares: number;
	totalShares: number;
	fundraisingDeadline: number;
	fundraisingCompletedOn: number;
	buildingStartedOn: number;
	buildingCompletedOn: number;
}
