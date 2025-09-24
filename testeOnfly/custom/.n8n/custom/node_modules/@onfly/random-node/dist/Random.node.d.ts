import { INodeType, type INodeTypeDescription } from 'n8n-workflow';
/**
 * Random (True Random Number Generator) custom node
 * Uses Random.org public endpoint (plain text) to fetch a single integer in [min, max].
 */
export declare class Random implements INodeType {
    description: INodeTypeDescription;
    execute(this: any): Promise<any>;
}
