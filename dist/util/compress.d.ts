//#region lib/util/compress.d.ts
declare function compressToBuffer(input: string, quality?: number): Promise<Buffer>;
declare function decompressFromBuffer(input: Buffer): Promise<string>;
declare function compressToBase64(input: string): Promise<string>;
declare function decompressFromBase64(input: string): Promise<string>;
//#endregion
export { compressToBase64, compressToBuffer, decompressFromBase64, decompressFromBuffer };
//# sourceMappingURL=compress.d.ts.map