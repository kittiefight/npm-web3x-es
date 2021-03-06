/// <reference types="node" />
import { Address } from '../address';
import { BlockHeaderResponse, BlockResponse, CallRequest, EstimateRequest, LogRequest, LogResponse, PartialTransactionRequest, TransactionRequest, TransactionResponse } from '../formatters';
import { EthereumProvider } from '../providers/ethereum-provider';
import { Subscription } from '../subscriptions';
import { TransactionHash } from '../types';
import { Wallet } from '../wallet';
import { BlockHash, BlockType } from './block';
import { EthRequestPayloads } from './eth-request-payloads';
import { SendTx } from './send-tx';
export declare type TypedSigningData = {
    type: string;
    name: string;
    value: string;
}[];
export declare class Eth {
    readonly provider: EthereumProvider;
    readonly request: EthRequestPayloads;
    wallet?: Wallet;
    constructor(provider: EthereumProvider);
    static fromCurrentProvider(): Eth | undefined;
    defaultFromAddress: Address | undefined;
    private send;
    getId(): Promise<number>;
    getNodeInfo(): Promise<string>;
    getProtocolVersion(): Promise<string>;
    getCoinbase(): Promise<Address>;
    isMining(): Promise<boolean>;
    getHashrate(): Promise<number>;
    isSyncing(): Promise<boolean | import("../formatters").Sync>;
    getGasPrice(): Promise<string>;
    getAccounts(): Promise<Address[]>;
    getBlockNumber(): Promise<number>;
    getBalance(address: Address, block?: BlockType): Promise<string>;
    getStorageAt(address: Address, position: string, block?: BlockType): Promise<string>;
    getCode(address: Address, block?: BlockType): Promise<string>;
    getBlock(block: BlockType | BlockHash, returnTxs?: false): Promise<BlockResponse<Buffer>>;
    getBlock(block: BlockType | BlockHash, returnTxs?: true): Promise<BlockResponse<TransactionResponse>>;
    getUncle(block: BlockType | BlockHash, uncleIndex: number, returnTxs?: false): Promise<BlockResponse<Buffer>>;
    getUncle(block: BlockType | BlockHash, uncleIndex: number, returnTxs?: true): Promise<BlockResponse<TransactionResponse>>;
    getBlockTransactionCount(block: BlockType | BlockHash): Promise<number>;
    getBlockUncleCount(block: BlockType | BlockHash): Promise<number>;
    getTransaction(hash: TransactionHash): Promise<TransactionResponse>;
    getTransactionFromBlock(block: BlockType | BlockHash, index: number): Promise<TransactionResponse>;
    getTransactionReceipt(txHash: TransactionHash): Promise<import("../formatters").TransactionReceipt<void> | null>;
    getTransactionCount(address: Address, block?: BlockType): Promise<number>;
    signTransaction(tx: TransactionRequest): Promise<import("./signed-transaction").SignedTransaction>;
    sendSignedTransaction(data: string): SendTx;
    sendTransaction(tx: PartialTransactionRequest): SendTx;
    private getAccount;
    sign(address: Address, dataToSign: string): Promise<string>;
    signTypedData(address: Address, dataToSign: TypedSigningData): Promise<string>;
    call(tx: CallRequest, block?: BlockType): Promise<string>;
    estimateGas(tx: EstimateRequest): Promise<number>;
    submitWork(nonce: string, powHash: string, digest: string): Promise<boolean>;
    getWork(): Promise<string[]>;
    getPastLogs(options: LogRequest): Promise<LogResponse[]>;
    subscribe(type: 'logs', options?: LogRequest): Subscription<LogResponse>;
    subscribe(type: 'syncing'): Subscription<object | boolean>;
    subscribe(type: 'newBlockHeaders'): Subscription<BlockHeaderResponse>;
    subscribe(type: 'pendingTransactions'): Subscription<TransactionResponse>;
}
