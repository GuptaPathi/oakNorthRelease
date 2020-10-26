/* ======================================================== 
* @template name : investmentPortfolio.js 
* @author : EY - Ranjith 
* @purpose: This JS file is responsible for creating/displaying inverstment portfolios.
* @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ManageInformationUtil from 'c/manageInformationUtil';
import OTHER_ASSET_OBJECT from '@salesforce/schema/Other_Customer_Asset__c';

// importing Labels
import UI_Text_Label_InvestPortQue from '@salesforce/label/c.UI_Text_Label_InvestPortQue';
import UI_Text_Label_PrivateTrustEx from '@salesforce/label/c.UI_Text_Label_PrivateTrustEx';
import UI_Input_Label_PortMangerLegalName from '@salesforce/label/c.UI_Input_Label_PortMangerLegalName';
import UI_Input_Label_InvestPortValue from '@salesforce/label/c.UI_Input_Label_InvestPortValue';
import UI_Input_Label_AnnualDividends from '@salesforce/label/c.UI_Input_Label_AnnualDividends';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';


export default class InvestmentPortfolios extends LightningElement {

    // private property Declaration
    @track bolDoYouHaveFlag;
    @track investmentRecordObj = { index: 0, Advisor_Full_Name_Portfolio_Manager__c: '', Investment_Portfolio_Value__c: '', Annual_Dividends__c: '' };
    @track arrIds = [];
    @track arrInvestmentPortfolioData = [];
    @track strRecordTypeId


    // exporting labels
    label = {
        UI_Text_Label_InvestPortQue,
        UI_Text_Label_PrivateTrustEx,
        UI_Input_Label_PortMangerLegalName,
        UI_Input_Label_InvestPortValue,
        UI_Input_Label_AnnualDividends,
        UI_Text_Label_AddAnother,
        UI_Text_Label_DeleteSucess,
        UI_Button_Label_Next
    };


    // public property Declaration
    @api utillCmpObject;


    // property Declaration
    get showDeleteIcon() {
        return this.arrInvestmentPortfolioData.length > 1 ? true : false;
    }

    get showInvestmentPortfolioFields() {
        return this.arrInvestmentPortfolioData.length > 0 ? true : false;
    }


    /* ======================================================== 
    * @method name : wire() 
    * @author : EY - Ranjith 
    * @purpose: Wire method to get Investment RecordType Id from Other asset object
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    @wire(getObjectInfo, { objectApiName: OTHER_ASSET_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Investment');

        } else if (error) {
            this.toastMessage(error.body.message, 'error');
        }
    }


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Ranjith 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    connectedCallback() {
        var investmentData = [];

        if (undefined !== this.utillCmpObject.formUpdatedData['InvestmentPortfolios'].length) {

            if (this.utillCmpObject.formUpdatedData['InvestmentPortfolios'].length > 0) {

                this.utillCmpObject.formUpdatedData['InvestmentPortfolios'].forEach((ele, rowindex) => {
                    ele['index'] = rowindex;
                    investmentData.push(ele);
                })

                this.arrInvestmentPortfolioData = investmentData;
                if (0 < investmentData.length) {
                    this.bolDoYouHaveFlag = 'Yes';
                }

            }
        }

    }


    /* ======================================================== 
    * @method name : handleDoYouHaveClick() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    handleDoYouHaveClick(event) {

        if ('Yes' === event.detail) {
            this.addOtherPortfolio();

        } else {
            let arrIds = []; // To hold all record Ids

            if (0 !== this.arrInvestmentPortfolioData.length) {
                //Collecting each record Id
                this.arrInvestmentPortfolioData.forEach((ele, index) => {

                    if (ele.Id) {
                        arrIds.push(ele.Id);
                    }
                });

                //More than one id 
                if (1 < arrIds.length) {
                    this.utillCmpObject.formUpdatedData['Investment'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: arrIds
                    });

                    this.dispatchEvent(deleteEvent);

                } else if (1 === arrIds.length) { // Only one Id
                    this.deleteInvestmentRecord(arrIds[0]);
                    this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.arrInvestmentPortfolioData = [];

                    this.handleNext();

                } else { // No ids
                    this.arrInvestmentPortfolioData = [];

                    this.handleNext();
                }
            } else {
                this.handleNext();
            }

        }
    }


    /* ======================================================== 
    * @method name : handleChange() 
    * @author : EY - Ranjith 
    * @purpose: form element onchange event calls this method to update data to variable.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : event - Holds event data of firing form element.
    ============================================================ */
    handleChange(event) {
        this.arrInvestmentPortfolioData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.arrInvestmentPortfolioData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.arrInvestmentPortfolioData[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
        this.investmentRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.investmentRecordObj[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
    }


    /* ======================================================== 
    * @method name : addOtherPortfolio() 
    * @author : EY - Ranjith 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    addOtherPortfolio() {
        this.investmentRecordObj['index'] = this.arrInvestmentPortfolioData.length;
        var record = JSON.stringify(this.investmentRecordObj);
        let pagevalid = this.utillCmpObject.validations(this.template, ['lightning-input']);

        if (pagevalid) {

            this.arrInvestmentPortfolioData.push(JSON.parse(record));

        }
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Ranjith 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Holds event data of firing form element
    ============================================================ */
    removeRecord(event) {
        this.removeInvestmentRecord(event.currentTarget.dataset.index)
        this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess, 'success');
    }


    /* ======================================================== 
    * @method name : removeInvestmentRecord() 
    * @author : EY - Ranjith 
    * @purpose: To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : index -Holds index data of firing form element
    ============================================================ */
    removeInvestmentRecord(index) {
        var deletedRecord = this.arrInvestmentPortfolioData[index];

        if (deletedRecord.Id) {
            this.deleteInvestmentRecord(deletedRecord.Id);
        }
        this.arrInvestmentPortfolioData.splice(index, 1);

    }


    /* ======================================================== 
    * @method name : removeInvestmentRecord() 
    * @author : EY - Ranjith 
    * @purpose: To delete single record
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : recordId -Holds recordId of the record.
    ============================================================ */
    deleteInvestmentRecord(recordId) {

        deleteRecord(recordId)
            .then((ret) => {
                return 'success';
            })
            .catch(error => {
                this.toastMessage('Error', error.body.message, 'error');
            });
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Ranjith 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleNext() {
        let pageValid = true;
        if (0 < this.arrInvestmentPortfolioData.length) {
            pageValid = this.utillCmpObject.validations(this.template, ['lightning-input']);
        }
        if (pageValid) {
            this.arrInvestmentPortfolioData.forEach(ele => {
                delete ele.index;
                delete ele.radioFlag;
            });
            this.utillCmpObject.formUpdatedData['InvestmentPortfolios'] = this.arrInvestmentPortfolioData;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: OTHER_ASSET_OBJECT.objectApiName
            });
            this.dispatchEvent(nextEvent);
        }
    }


    /* ======================================================================== 
    * @method name : toastMessage() 
    * @author : EY - Gupta 
    * @purpose:toast message utility
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    toastMessage(strTitle, strMessage, strVariant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: strTitle,
                message: strMessage,
                variant: strVariant,
            }),
        );
    }
}