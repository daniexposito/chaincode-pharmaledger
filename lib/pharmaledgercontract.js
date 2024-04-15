/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Habber's pharma ledger supply chain network smart contract
 * Paper: Unión de tecnologías blockchain en una cadena de suministros con BPM en una organización: una propuesta de integración con agentes de IA y mecanismos de subasta de derivados financieros
 * Author: Daniel Expósito García
 */
'use strict';
// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

/**
 * Define PharmaLedger smart contract by extending Fabric Contract class
 */
class PharmaLedgerContract extends Contract {

    constructor() {
        // Unique namespace pcn - PharmaChainNetwork when multiple contracts per chaincode file
        super('org.pln.PharmaLedgerContract');
    }
    /**
     * Instantiate to set up ledger.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No default implementation for this example
        console.log('Instantiate the PharmaLedger contract');
    }
    
    /**
     * Initiate a new clinical trial for a drug.
     * @param {Context} ctx the transaction context
     * @param {String} trialNumber the trial number
     * @param {String} drugName the drug name
     * @param {String} trialName the trial name
     * @param {String} trialStartDate the trial date
     * @param {String} trialEndDate the trial end date
     * @param {String} trialDescription the trial description
     */
    async initiateClinicalTrial(ctx, trialNumber, drugName, trialName, trialStartDate, trialEndDate, trialDescription) {
        if (!ctx.clientIdentity.getMSPID().includes('Org1MSP')) {
            throw new Error(`Client ${ctx.clientIdentity.getID()} must be a manufacturer`);
        }
        console.info('============= START : initiateClinicalTrial ===========');
        const trialKey = ctx.stub.createCompositeKey('trial~', [trialNumber]);
        const trial = {
            trialNumber,
            drugName,
            trialName,
            trialStartDate: new Date(trialStartDate).toString(),
            trialEndDate: new Date(trialEndDate).toString(),
            trialVersion: '1.0',
            lastUpdate: new Date().toString(),
            trialDescription,
            owner: ctx.clientIdentity.getID(),
            state: 'INITIATED'
        };
        await ctx.stub.putState(trialKey, Buffer.from(JSON.stringify(trial)));
        console.info('============= END : initiateClinicalTrial ===========');
        return trial;
    }

    /**
     * Register the results of a clinical trial.
     * @param {Context} ctx the transaction context
     * @param {String} trialNumber the trial number
     * @param {String} trialVersion the trial version
     * @param {String} trialResult the trial result
     * @param {String} trialConclusion the trial conclusion
     * @param {String} state the trial state
     * @param {String} trialDescription the trial description
     */
    async registerClinicalTrialResults(ctx, trialNumber, trialVersion, trialResult, trialConclusion, state, trialDescription) {
        
        console.info('============= START : registerClinicalTrialResults ===========');
        const trialKey = ctx.stub.createCompositeKey('trial~', [trialNumber]);
        const trialAsBytes = await ctx.stub.getState(trialKey);
        if (!trialAsBytes || trialAsBytes.length === 0) {
            throw new Error(`${trialNumber} does not exist`);
        }
        const strValue = Buffer.from(trialAsBytes).toString('utf8');
        let trial;
        try {
            trial = JSON.parse(strValue);
            if (trial.owner !== ctx.clientIdentity.getID()) {
                throw new Error(`Client ${ctx.clientIdentity.getID()} is not the trial owner`);
            }

            if (state !== 'COMPLETED' && state !== 'FAILED') {
                throw new Error(`trial state must be COMPLETED or FAILED`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`trial ${trialNumber} data can't be processed`);
        }
        trial.trialDescription = trialDescription;
        trial.trialResult = trialResult;
        trial.trialConclusion = trialConclusion;
        trial.state = state;
        trial.trialVersion = trialVersion == "" ? trial.trialVersion : trialVersion;
        trial.lastUpdate = new Date().toString();
        await ctx.stub.putState(trialKey, Buffer.from(JSON.stringify(trial)));
        console.info('============= END : registerClinicalTrialResults ===========');
        return trial;
    }


    /**
     * Register a patent.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} patentName the patent name
     * @param {String} clinicalTrialNumber the clinical trial number
     * @param {Date} patentDate the patent date
     */
    async registerPatent(ctx, patentNumber, patentName, clinicalTrialNumber, patentDate) {
        if (!ctx.clientIdentity.getMSPID().includes('Org1MSP')) {
            throw new Error(`bidder ${ctx.clientIdentity.getID()} must be a manufacturer`);
        }
        //Check if clinical trial exists
        const trialKey = ctx.stub.createCompositeKey('trial~', [clinicalTrialNumber]);
        const trialAsBytes = await ctx.stub.getState(trialKey);
        if (!trialAsBytes || trialAsBytes.length === 0) {
            throw new Error(`${clinicalTrialNumber} does not exist`);
        }
        //Check if clinical trial is completed
        const strValue = Buffer.from(trialAsBytes).toString('utf8');
        let trial;
        try {
            trial = JSON.parse(strValue);
            if (trial.state !== 'COMPLETED') {
                throw new Error(`trial ${clinicalTrialNumber} is not completed`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`trial ${clinicalTrialNumber} data can't be processed`);
        }

        console.info('============= START : registerPatent ===========');
        const patentKey = ctx.stub.createCompositeKey('patent~', [patentNumber]);
        const patent = {
            patentNumber,
            trialNumber: clinicalTrialNumber,
            patentName,
            patentOwner: ctx.clientIdentity.getID(),
            patentDate,
            state: 'REGISTERED'
        };
        await ctx.stub.putState(patentKey, Buffer.from(JSON.stringify(patent)));
        console.info('============= END : registerPatent ===========');
        return patent;
    }

    /**
     * Fabricate a batch of drugs from a patent.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} batchNumber the batch number
     * @param {String} drugName the batch's drug name
     * @param {String} fabricationDate the batch fabrication date
     * @param {String} expirationDate the batch expiration date
     * @param {Number} quantity the batch quantity
     */
    async fabricateBatch(ctx, patentNumber, batchNumber, drugName, fabricationDate, expirationDate, quantity) {
        try {
            //Check if patent exists
            const patentKey = ctx.stub.createCompositeKey('patent~', [patentNumber]);
            const patentAsBytes = await ctx.stub.getState(patentKey);
            if (!patentAsBytes || patentAsBytes.length === 0) {
                throw new Error(`${patentNumber} does not exist`);
            }
            //Check if ctx.ClientIdentity is the patent owner and if patent is registered.
            const strValue = Buffer.from(patentAsBytes).toString('utf8');
            let patent;
            try {
                patent = JSON.parse(strValue);
                if (patent.patentOwner !== ctx.clientIdentity.getID()) {
                    throw new Error(`Client ${ctx.clientIdentity.getID()} is not the patent owner, ${patent.patentOwner} is the owner`);
                }
                if (patent.state !== 'REGISTERED') {
                    throw new Error(`patent ${patentNumber} is not registered`);
                }
            } catch (err) {
                console.log(err);
                throw new Error(`patent ${patentNumber} data can't be processed`);
            }
            // Check if batch exists with composite key
            const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
            const batchAsBytes = await ctx.stub.getState(batchKey);
            if (batchAsBytes && batchAsBytes.length > 0) {
                throw new Error(`${batchNumber} already exists`);
            }

            console.info('============= START : fabricateBatch ===========');
            const batch = {
                patentNumber,
                batchNumber,
                drugName,
                fabricatedBy: ctx.clientIdentity.getID(),
                owner: ctx.clientIdentity.getID(),
                fabricationDate: new Date(fabricationDate).toString(),
                expirationDate: new Date(expirationDate).toString(),
                quantity,
                state: "FABRICATED"
            };
            // Store composite key for batch
            await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));
            console.info('============= END : fabricateBatch ===========');
            
            return batch;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Analyze a batch of drugs.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} batchNumber the batch number
     * @param {String} analysisDate the analysis date
     * @param {String} analysisResult the analysis result
     */
    async analyzeBatch(ctx, patentNumber, batchNumber, analysisDate, analysisResult) {
        try {
            // Check if batch exists with composite key
            const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
            const batchAsBytes = await ctx.stub.getState(batchKey);
            if (!batchAsBytes || batchAsBytes.length === 0) {
                throw new Error(`${batchNumber} does not exist`);
            }
            const strValue = Buffer.from(batchAsBytes).toString('utf8');
            let batch;
            try {
                batch = JSON.parse(strValue);
                if (batch.owner !== ctx.clientIdentity.getID()) {
                    throw new Error(`Client ${ctx.clientIdentity.getID()} is not the batch owner`);
                }
                if (batch.state !== 'FABRICATED') {
                    throw new Error(`batch ${batchNumber} is not fabricated`);
                }
            } catch (err) {
                console.log(err);
                throw new Error(`batch ${batchNumber} data can't be processed`);
            }

            console.info('============= START : analyzeBatch ===========');
            batch.analysisDate = new Date(analysisDate).toString();
            //Check if analysis result is CONFORM or NOT_CONFORM
            if (analysisResult !== 'CONFORM' && analysisResult !== 'NOT_CONFORM') {
                throw new Error(`analysis result must be CONFORM or NOT_CONFORM`);
            }
            batch.analysisResult = analysisResult;
            batch.state = "ANALYZED";
            await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));
            return batch;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create an option financial derivative for a patent.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} optionNumber the option number
     * @param {number} price the option price per unit
     * @param {quantity} quantity the option quantity
     * @param {String} contractDetails the contract details
     * @param {String} expiryDate the option expiry date
     */
    async createOption(ctx, patentNumber, optionNumber, price, quantity, contractDetails, expiryDate) {
        // Check if patent exists
        const patentKey = ctx.stub.createCompositeKey('patent~', [patentNumber]);
        const patentAsBytes = await ctx.stub.getState(patentKey);
        if (!patentAsBytes || patentAsBytes.length === 0) {
            throw new Error(`${patentNumber} does not exist`);
        }
        const strValue = Buffer.from(patentAsBytes).toString('utf8');
        let patent;
        try {
            patent = JSON.parse(strValue);
            if (patent.patentOwner !== ctx.clientIdentity.getID()) {
                throw new Error(`Client ${ctx.clientIdentity.getID()} is not the patent owner`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`patent ${patentNumber} data can't be processed`);
        }

        const optionKey = ctx.stub.createCompositeKey('option~', [optionNumber]);
        console.info('============= START : createOption ===========');
        let option;
        //Check that price and quantity are positive numbers
        if (price <= 0 || quantity <= 0) {
            throw new Error(`price and quantity must be positive numbers`);
        }

        //Check that expiryDate is in the future and is a valid date
        try {
            if (new Date(expiryDate) < new Date()) {
                throw new Error(`expiryDate must be in the future`);
            }
        }catch (err) {
            console.log(err);
            throw new Error(`expiryDate must be a valid date`);
        }

        option = {
            optionNumber,
            patentNumber,
            price,
            quantity,
            contractDetails,
            expiryDate: new Date(expiryDate).toString(),
            state: "CREATED"
        };
        // Store composite key for option
        await ctx.stub.putState(optionKey, Buffer.from(JSON.stringify(option)));
        return option;
    }

    /** 
     * Auction a batch of drugs to a wholesaler.
     * @param {Context} ctx the transaction context
     * @param {String} auctionNumber the auction number
     * @param {String} patentNumber the patent number
     * @param {String} batchNumber the batch number
     * @param {String} auctionDate the auction date
     * @param {String} auctionPrice the auction price
     */
    async auctionBatch(ctx, auctionNumber, patentNumber, batchNumber, auctionDate, auctionPrice) {
        // Check if batch exists with composite key
        const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
        const batchAsBytes = await ctx.stub.getState(batchKey);
        if (!batchAsBytes || batchAsBytes.length === 0) {
            throw new Error(`${batchNumber} does not exist`);
        }
        const strValue = Buffer.from(batchAsBytes).toString('utf8');
        let batch;
        try {
            batch = JSON.parse(strValue);
            if (batch.owner !== ctx.clientIdentity.getID()) {
                throw new Error(`Client ${ctx.clientIdentity.getID()} is not the batch owner`);
            }
            if (batch.state !== 'ANALYZED') {
                throw new Error(`batch ${batchNumber} is not analyzed`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`batch ${batchNumber} data can't be processed`);
        }
        const auctionKey = ctx.stub.createCompositeKey('auction~', [auctionNumber]);

        console.info('============= START : auctionBatch ===========');
        let auction;
        auction = {
            auctionNumber,
            patentNumber,
            batchNumber,
            auctionedBy: ctx.clientIdentity.getID(),
            auctionDate: new Date(auctionDate).toString(),
            auctionPrice,
            state: "IN_AUCTION",
            buyer: "",
            price: 0
        };

        // Store composite key for auction
        await ctx.stub.putState(auctionKey, Buffer.from(JSON.stringify(auction)));
        return auction;
    }

    /**
     * Bid for a batch of drugs in an auction.
     * @param {Context} ctx the transaction context
     * @param {String} auctionNumber the auction number
     * @param {number} price the bid price
     */
    async bidForBatch(ctx, auctionNumber, price) {
        // Check if auction exists
        const auctionKey = ctx.stub.createCompositeKey('auction~', [auctionNumber]);
        const auctionAsBytes = await ctx.stub.getState(auctionKey);
        if (!auctionAsBytes || auctionAsBytes.length === 0) {
            throw new Error(`${auctionNumber} does not exist`);
        }
        const strValue = Buffer.from(auctionAsBytes).toString('utf8');
        let auction;
        try {
            auction = JSON.parse(strValue);
            if (auction.state !== 'IN_AUCTION') {
                throw new Error(`auction ${auctionNumber} is not in auction`);
            }
            if (new Date(auction.auctionDate) < new Date()) {
                throw new Error(`auction ${auctionNumber} is closed`);
            }
            if (auction.auctionPrice > price) {
                throw new Error(`bid price must be higher than auction price`);
            }
            
        } catch (err) {
            console.log(err);
            throw new Error(`auction ${auctionNumber} data can't be processed`);
        }

        //Check if bidder MspId is from wholesaler
        if (!ctx.clientIdentity.getMSPID().includes('Org2MSP')) {
            throw new Error(`bidder ${ctx.clientIdentity.getID()} must be a wholesaler`);
        }

        // Check if bid price is higher than current price
        if (price <= auction.price) {
            throw new Error(`bid price must be higher than current price`);
        }

        console.info('============= START : bidForBatch ===========');
        auction.buyer = ctx.clientIdentity.getID();
        auction.price = price;
        await ctx.stub.putState(auctionKey, Buffer.from(JSON.stringify(auction)));
        console.info('============= END : bidForBatch ===========');
        return auction;
    }

    /**
     * Adjudge a batch of drugs to a wholesaler by the distributor.
     * @param {Context} ctx the transaction context
     * @param {String} auctionNumber the auction number
     */
    async adjudgeBatch(ctx, auctionNumber) {
        // Check if auction exists
        const auctionKey = ctx.stub.createCompositeKey('auction~', [auctionNumber]);
        const auctionAsBytes = await ctx.stub.getState(auctionKey);
        if (!auctionAsBytes || auctionAsBytes.length === 0) {
            throw new Error(`${auctionNumber} does not exist`);
        }
        const strValue = Buffer.from(auctionAsBytes).toString('utf8');
        let auction;
        try {
            auction = JSON.parse(strValue);
            if (auction.state !== 'IN_AUCTION') {
                throw new Error(`auction ${auctionNumber} is not in auction`);
            }
            if (new Date(auction.auctionDate) > new Date()) {
                throw new Error(`auction ${auctionNumber} is not closed`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`auction ${auctionNumber} data can't be processed`);
        }

        // Check if adjudge is called by the auctioneer
        if (ctx.clientIdentity.getID() !== auction.auctionedBy) {
            throw new Error(`Client ${ctx.clientIdentity.getID()} is not the auctioneer`);
        }

        console.info('============= START : adjudgeBatch ===========');
        auction.state = "ADJUDICATED";
        await ctx.stub.putState(auctionKey, Buffer.from(JSON.stringify(auction)));
        // Transfer ownership of batch to buyer
        const batchKey = ctx.stub.createCompositeKey('patent~batch', [auction.patentNumber, auction.batchNumber]);
        let batch = JSON.parse(Buffer.from(await ctx.stub.getState(batchKey)).toString());
        batch.owner = auction.buyer;
        batch.state = "WHOLESALE";
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));
        console.info('============= END : adjudgeBatch ===========');
        return batch;
    }

    /**
     * Ship a batch of drugs to a pharmacy.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} batchNumber the batch number
     * @param {String} shippingNumber the shipping number
     * @param {String} shipDate the ship date
     * @param {number} quantity the quantity to ship
     * @param {String} pharmacyName the pharmacy name
     * @param {String} pharmacyAddress the pharmacy address
     * @param {String} pharmacyPhone the pharmacy phone
     */
    async shipBatch(ctx, patentNumber, batchNumber, shippingNumber, shipDate, quantity, pharmacyName, pharmacyAddress, pharmacyPhone) {
        // Check if batch exists with composite key
        const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
        const batchAsBytes = await ctx.stub.getState(batchKey);
        if (!batchAsBytes || batchAsBytes.length === 0) {
            throw new Error(`${batchNumber} does not exist`);
        }
        const strValue = Buffer.from(batchAsBytes).toString('utf8');
        let batch;
        try {
            batch = JSON.parse(strValue);
            if (batch.owner !== ctx.clientIdentity.getID()) {
                throw new Error(`Client ${ctx.clientIdentity.getID()} is not the batch owner`);
            }
            if (batch.state !== 'WHOLESALE') {
                throw new Error(`batch ${batchNumber} is not wholesaled`);
            }
        } catch (err) {
            console.log(err);
            throw new Error(`batch ${batchNumber} data can't be processed`);
        }

        console.info('============= START : shipBatch ===========');
        //Check that there is enough quantity to ship
        if (quantity > batch.quantity) {
            throw new Error(`quantity to ship is higher than batch quantity`);
        }
        batch.quantity -= quantity;
        await ctx.stub.putState(batchKey, Buffer.from(JSON.stringify(batch)));

        const shipmentNumber = ctx.stub.createCompositeKey('shipment~', [shippingNumber]);
        //Check if shipment already exists
        const shipmentAsBytes = await ctx.stub.getState(shipmentNumber);
        if (shipmentAsBytes && shipmentAsBytes.length > 0) {
            throw new Error(`${shippingNumber} already exists`);
        }

        // Create a shipment
        const shipment = {
            shippingNumber,
            patentNumber,
            batchNumber,
            shipDate: new Date(shipDate).toString(),
            pharmacyName,
            pharmacyAddress,
            pharmacyPhone,
            quantity,
            state: "ON_PHARMACY"
        };
        // Store composite key for shipment
        await ctx.stub.putState(ctx.stub.createCompositeKey(shipmentNumber), Buffer.from(JSON.stringify(shipment)));
        console.info('============= END : shipBatch ===========');
    }

    /**
     * 
     * @param {*} ctx The transaction context 
     * @param {*} trialNumber The trial number
     * @returns  The clinical trial
     */
    async queryClinicalTrial(ctx, trialNumber) {
        const trialKey = ctx.stub.createCompositeKey('trial~', [trialNumber]);
        const trialAsBytes = await ctx.stub.getState(trialKey);
        if (!trialAsBytes || trialAsBytes.length === 0) {
            throw new Error(`${trialNumber} does not exist`);
        }
        const strValue = Buffer.from(trialAsBytes).toString('utf8');
        let trial;
        try {
            trial = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            trial = strValue;
        }
        return JSON.stringify({
            Key: trialKey,
            Record: trial
        });
    }

    /**
     * 
     * @param {*} ctx The transaction context 
     * @param {*} trialNumber The trial number
     * @returns  The clinical trial
     */
    async queryClinicalTrialHistory(ctx, trialNumber) {
        const trialKey = ctx.stub.createCompositeKey('trial~', [trialNumber]);
        const iterator = await ctx.stub.getHistoryForKey(trialKey);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    async queryPatent(ctx, patentNumber) {
        const patentKey = ctx.stub.createCompositeKey('patent~', [patentNumber]);
        const patentAsBytes = await ctx.stub.getState(patentKey);
        if (!patentAsBytes || patentAsBytes.length === 0) {
            throw new Error(`${patentNumber} does not exist`);
        }
        const strValue = Buffer.from(patentAsBytes).toString('utf8');
        let patent;
        try {
            patent = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            patent = strValue;
        }
        return JSON.stringify({
            Key: patentKey,
            Record: patent
        });
    }

    async queryPatentHistory(ctx, patentNumber) {
        const patentKey = ctx.stub.createCompositeKey('patent~', [patentNumber]);
        const iterator = await ctx.stub.getHistoryForKey(patentKey);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    /**
     * Query the batch by patent number and batch number.
     * Return the batch.
     * @param {Context} ctx the transaction context
     * @param {String} patentNumber the patent number
     * @param {String} batchNumber the batch number
     * @returns {String} the batch lifecycle
     */
    async queryBatch(ctx, patentNumber, batchNumber) {
        const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
        const batchAsBytes = await ctx.stub.getState(batchKey);
        if (!batchAsBytes || batchAsBytes.length === 0) {
            throw new Error(`${batchNumber} does not exist`);
        }
        const strValue = Buffer.from(batchAsBytes).toString('utf8');
        let batch;
        try {
            batch = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            batch = strValue;
        }
        //Obtain the patent details
        let patent = this.queryPatent(ctx, patentNumber);
        let patentValue = Buffer.from(patent).toString('utf8');
        //Obtain the trial details
        let trial = this.queryClinicalTrial(ctx, patent.trialNumber);
        let trialValue = Buffer.from(trial).toString('utf8');
        
        return JSON.stringify({
            Batch: {
                Key: batchKey,
                Record: batch,
            },
            Patent: JSON.parse(patentValue),
            Trial: JSON.parse(trialValue)
        });
    }

    /**
     * Query the batch history by patent number and batch number. And obtain batch history
     * Return the batch history.
     */
    async queryBatchHistory(ctx, patentNumber, batchNumber) {
        const batchKey = ctx.stub.createCompositeKey('patent~batch', [patentNumber, batchNumber]);
        const iterator = await ctx.stub.getHistoryForKey(batchKey);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(result);
    }

    /**
     * Query all the batch history by patent number and batch number.
     * Return the batch, patent and trial history. 
     */
    async queryBatchHistoryAll(ctx, patentNumber, batchNumber) {
        const batch = await this.queryBatchHistory(ctx, patentNumber, batchNumber);
        const patent = await this.queryPatentHistory(ctx, patentNumber);
        const trial = await this.queryClinicalTrialHistory(ctx, patent.trialNumber);
        return JSON.stringify({
            Batch: JSON.parse(batch),
            Patent: JSON.parse(patent),
            Trial: JSON.parse(trial)
        });
    }

    /**
     * Query the batch history from a shipment.
     * Return the batch history + the shipment.
     */
    async queryShipmentHistory(ctx, shippingNumber) {
        const shipmentNumber = ctx.stub.createCompositeKey('shipment~', [shippingNumber]);
        const shipmentAsBytes = await ctx.stub.getState(shipmentNumber);
        if (!shipmentAsBytes || shipmentAsBytes.length === 0) {
            throw new Error(`${shippingNumber} does not exist`);
        }
        const shipmentValue = Buffer.from(shipmentAsBytes).toString('utf8');
        const shipment = JSON.parse(shipmentValue);

        const batch = await this.queryBatchHistory(ctx, shipment.patentNumber, shipment.batchNumber);

        const iterator = await ctx.stub.getHistoryForKey(shipmentNumber);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }        
        //Add the batch history to the shipment history
        result.push(JSON.parse(batch));

        await iterator.close();
        return JSON.stringify(result);
    }

}

module.exports = PharmaLedgerContract;