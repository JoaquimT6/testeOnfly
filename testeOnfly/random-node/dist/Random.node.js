"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Random = void 0;
const n8n_workflow_1 = require("n8n-workflow");
/**
 * Random (True Random Number Generator) custom node
 * Uses Random.org public endpoint (plain text) to fetch a single integer in [min, max].
 */
class Random {
    constructor() {
        this.description = {
            displayName: 'Random',
            name: 'random',
            icon: 'file:random.svg',
            group: ['transform'],
            version: 1,
            description: 'True Random Number Generator via Random.org',
            defaults: {
                name: 'Random',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    options: [
                        {
                            name: 'True Random Number Generator',
                            value: 'trng',
                            description: 'Generate a true random integer using Random.org',
                        },
                    ],
                    default: 'trng',
                },
                {
                    displayName: 'Min',
                    name: 'min',
                    type: 'number',
                    typeOptions: {
                        numberPrecision: 0,
                    },
                    default: 1,
                    description: 'Lower bound (inclusive)',
                },
                {
                    displayName: 'Max',
                    name: 'max',
                    type: 'number',
                    typeOptions: {
                        numberPrecision: 0,
                    },
                    default: 60,
                    description: 'Upper bound (inclusive)',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i);
            if (operation !== 'trng') {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Unsupported operation', {
                    itemIndex: i,
                });
            }
            const min = this.getNodeParameter('min', i);
            const max = this.getNodeParameter('max', i);
            if (!Number.isInteger(min) || !Number.isInteger(max)) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Min and Max must be integers', {
                    itemIndex: i,
                });
            }
            if (min > max) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Min must be <= Max', {
                    itemIndex: i,
                });
            }
            const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
            try {
                // n8n helper returns string for plain responses
                const response = (await this.helpers.httpRequest({
                    method: 'GET',
                    url,
                    returnFullResponse: false,
                    qs: {},
                }));
                const value = parseInt(String(response).trim(), 10);
                if (!Number.isFinite(value)) {
                    throw new Error('Could not parse integer from response');
                }
                if (value < min || value > max) {
                    throw new Error('Response out of requested range');
                }
                returnData.push({
                    json: {
                        value,
                        min,
                        max,
                        source: 'random.org',
                        endpoint: url,
                        timestamp: new Date().toISOString(),
                    },
                });
            }
            catch (error) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error.message || 'Request failed', {
                    itemIndex: i,
                });
            }
        }
        return this.prepareOutputData(returnData);
    }
}
exports.Random = Random;
