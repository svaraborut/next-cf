export type BytesArray = Uint8Array | ArrayBuffer

// For simplicity ArrayBuffer will be treated as a buffer of individual bytes
export function coerceUint8(data: BytesArray): Uint8Array {
	// https://stackoverflow.com/questions/15251879
	return ArrayBuffer.isView(data) ? data : new Uint8Array(data)
}

export function toHex(data: BytesArray): string {
	// https://stackoverflow.com/questions/34309988
	return Array.from(coerceUint8(data))
		.map((byte) => (byte & 0xff).toString(16).padStart(2, '0'))
		.join('')
}
