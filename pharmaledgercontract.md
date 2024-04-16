### Table of Contents

*   [][1]
*   [PharmaLedgerContract][2]
    *   [instantiate][3]
        *   [Parameters][4]
    *   [initiateClinicalTrial][5]
        *   [Parameters][6]
    *   [registerClinicalTrialResults][7]
        *   [Parameters][8]
    *   [registerPatent][9]
        *   [Parameters][10]
    *   [fabricateBatch][11]
        *   [Parameters][12]
    *   [analyzeBatch][13]
        *   [Parameters][14]
    *   [createOption][15]
        *   [Parameters][16]
    *   [buyOption][17]
        *   [Parameters][18]
    *   [transferOption][19]
        *   [Parameters][20]
    *   [executeOption][21]
        *   [Parameters][22]
    *   [exerciseOption][23]
        *   [Parameters][24]
    *   [shipBatch][25]
        *   [Parameters][26]
    *   [queryClinicalTrial][27]
        *   [Parameters][28]
    *   [queryClinicalTrialHistory][29]
        *   [Parameters][30]
    *   [queryBatch][31]
        *   [Parameters][32]
    *   [queryBatchHistory][33]
        *   [Parameters][34]
    *   [queryBatchHistoryAll][35]
        *   [Parameters][36]
    *   [queryShipmentHistory][37]
        *   [Parameters][38]

##

Habber's pharma ledger supply chain network smart contract
Work: Demostración del valor de una blockchain privada para problemas diversos y la integración con otras tecnologías.
Author: Daniel Expósito García (HabberTec)

## PharmaLedgerContract

**Extends Contract**

Define PharmaLedger smart contract by extending Fabric Contract class

### instantiate

Instantiate to set up ledger.

#### Parameters

*   `ctx` **Context** the transaction context

### initiateClinicalTrial

Initiate a new clinical trial for a drug.

#### Parameters

*   `ctx` **Context** the transaction context
*   `trialNumber` **[String][39]** the trial number
*   `drugName` **[String][39]** the drug name
*   `trialName` **[String][39]** the trial name
*   `trialStartDate` **[String][39]** the trial date
*   `trialEndDate` **[String][39]** the trial end date
*   `trialDescription` **[String][39]** the trial description

### registerClinicalTrialResults

Register the results of a clinical trial.

#### Parameters

*   `ctx` **Context** the transaction context
*   `trialNumber` **[String][39]** the trial number
*   `trialVersion` **[String][39]** the trial version
*   `trialResult` **[String][39]** the trial result
*   `trialConclusion` **[String][39]** the trial conclusion
*   `state` **[String][39]** the trial state
*   `trialDescription` **[String][39]** the trial description

### registerPatent

Register a patent.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `patentName` **[String][39]** the patent name
*   `clinicalTrialNumber` **[String][39]** the clinical trial number
*   `patentDate` **[Date][40]** the patent date

### fabricateBatch

Fabricate a batch of drugs from a patent.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `batchNumber` **[String][39]** the batch number
*   `drugName` **[String][39]** the batch's drug name
*   `fabricationDate` **[String][39]** the batch fabrication date
*   `expirationDate` **[String][39]** the batch expiration date
*   `quantity` **[Number][41]** the batch quantity

### analyzeBatch

Analyze a batch of drugs.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `batchNumber` **[String][39]** the batch number
*   `analysisDate` **[String][39]** the analysis date
*   `analysisResult` **[String][39]** the analysis result

### createOption

Create an option financial derivative for a patent.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `optionNumber` **[String][39]** the option number
*   `price` **[number][41]** the option price per unit
*   `quantity` **[number][41]** quantity
*   `contractDetails` **[String][39]** the contract details
*   `expiryDate` **[String][39]** the option expiry date

### buyOption

The long call buys the option.

#### Parameters

*   `ctx` **Context** the transaction context
*   `optionNumber` **[String][39]** the option number
*   `payedBounty` **[number][41]** the payed bounty

### transferOption

Transfer the option to another client.

#### Parameters

*   `ctx` **Context** the transaction context
*   `optionNumber` **[String][39]** the option number
*   `newOwner` **[String][39]** the new owner

### executeOption

Execute the option financial derivative.

#### Parameters

*   `ctx` **Context** the transaction context
*   `optionNumber` **[String][39]** the option number

### exerciseOption

Check if the seller can exercise the option. If it can, then transfer batch ownership to the buyer.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `sellerId` **[String][39]** the seller id

### shipBatch

Ship a batch to a pharmacy.

#### Parameters

*   `ctx` **Context**&#x20;
*   `patentNumber` **[string][39]**&#x20;
*   `batchNumber` **[string][39]**&#x20;
*   `shippingNumber` **[string][39]**&#x20;
*   `shipDate` **[string][39]**&#x20;
*   `quantity` **[string][39]**&#x20;
*   `pharmacyName` **[string][39]**&#x20;
*   `pharmacyAddress` **[string][39]**&#x20;
*   `pharmacyPhone` **[string][39]**&#x20;

### queryClinicalTrial

#### Parameters

*   `ctx` **any** The transaction context
*   `trialNumber` **any** The trial number

Returns **any** The clinical trial

### queryClinicalTrialHistory

#### Parameters

*   `ctx` **any** The transaction context
*   `trialNumber` **any** The trial number

Returns **any** The clinical trial

### queryBatch

Query the batch by patent number and batch number.
Return the batch.

#### Parameters

*   `ctx` **Context** the transaction context
*   `patentNumber` **[String][39]** the patent number
*   `batchNumber` **[String][39]** the batch number

Returns **[String][39]** the batch lifecycle

### queryBatchHistory

Query the batch history by patent number and batch number. And obtain batch history
Return the batch history.

#### Parameters

*   `ctx` &#x20;
*   `patentNumber` &#x20;
*   `batchNumber` &#x20;

### queryBatchHistoryAll

Query all the batch history by patent number and batch number.
Return the batch, patent and trial history.

#### Parameters

*   `ctx` &#x20;
*   `patentNumber` &#x20;
*   `batchNumber` &#x20;

### queryShipmentHistory

Query the batch history from a shipment.
Return the batch history + the shipment.

#### Parameters

*   `ctx` &#x20;
*   `shippingNumber` &#x20;

[1]: #

[2]: #pharmaledgercontract

[3]: #instantiate

[4]: #parameters

[5]: #initiateclinicaltrial

[6]: #parameters-1

[7]: #registerclinicaltrialresults

[8]: #parameters-2

[9]: #registerpatent

[10]: #parameters-3

[11]: #fabricatebatch

[12]: #parameters-4

[13]: #analyzebatch

[14]: #parameters-5

[15]: #createoption

[16]: #parameters-6

[17]: #buyoption

[18]: #parameters-7

[19]: #transferoption

[20]: #parameters-8

[21]: #executeoption

[22]: #parameters-9

[23]: #exerciseoption

[24]: #parameters-10

[25]: #shipbatch

[26]: #parameters-11

[27]: #queryclinicaltrial

[28]: #parameters-12

[29]: #queryclinicaltrialhistory

[30]: #parameters-13

[31]: #querybatch

[32]: #parameters-14

[33]: #querybatchhistory

[34]: #parameters-15

[35]: #querybatchhistoryall

[36]: #parameters-16

[37]: #queryshipmenthistory

[38]: #parameters-17

[39]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[40]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date

[41]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number
