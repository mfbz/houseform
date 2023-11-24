export class TokenUtils {
	public static toNumber(value: bigint, decimals: number) {
		if (value === null || value === undefined) return value;
		return Number(BigInt(value) / BigInt(10 ** decimals));
	}

	public static toBigInt(value: number, decimals: number) {
		if (value === null || value === undefined) return value;
		return BigInt(value) * BigInt(10 ** decimals);
	}
}
