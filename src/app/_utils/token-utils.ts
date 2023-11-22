export class TokenUtils {
	public static toNumber(value: bigint, decimals: number) {
		return Number(BigInt(value) / BigInt(10 ** decimals));
	}

	public static toBigInt(value: number, decimals: number) {
		return BigInt(value) * BigInt(10 ** decimals);
	}
}
