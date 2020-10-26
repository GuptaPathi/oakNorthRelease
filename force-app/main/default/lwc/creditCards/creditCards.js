/* ======================================================== 
    * @template name : creditCards.js 
    * @author : EY - Ranjith 
    * @purpose: This js file creates, updates and deletes credit cards records
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LIABILITY_OBJECT from '@salesforce/schema/Liability__c';

//Importing Labels
import UI_Text_Label_CreditCardsQue from '@salesforce/label/c.UI_Text_Label_CreditCardsQue';
import UI_Text_Label_CreditCardsDetails from '@salesforce/label/c.UI_Text_Label_CreditCardsDetails';
import UI_Input_Label_LenderName from '@salesforce/label/c.UI_Input_Label_LenderName';
import UI_Input_Label_OwingAmount from '@salesforce/label/c.UI_Input_Label_OwingAmount';
import UI_Input_Label_MonthlyRepayments from '@salesforce/label/c.UI_Input_Label_MonthlyRepayments';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';



export default class CreditCards extends LightningElement {

    //declaring private variables
    @track creditCardRecordObj = { index: 0, Lender_Name__c: '', Amount_Owing__c: '', Monthly_Repayments__c: '' };
    @track doYouHaveFlag;
    @track strRecordTypeId
    @track arrIds = [];
    @track arrCreditCardData = [];

    //declaring public varibles
    @api utillCmpObject;

    //exporting lables
    label = {
        UI_Text_Label_AddAnother,
        UI_Text_Label_CreditCardsQue,
        UI_Text_Label_CreditCardsDetails,
        UI_Input_Label_LenderName,
        UI_Input_Label_OwingAmount,
        UI_Input_Label_MonthlyRepayments,
        UI_Button_Label_Next,
        UI_Text_Label_DeleteSucess
    };

    //property to show/hide delete icon 
    get showDeleteIcon() {
        return this.arrCreditCardData.length > 1 ? true : false;
    }

    //property to show/hide credit fields
    get showCreditFields() {
        return this.arrCreditCardData.length > 0 ? true : false;
    }

    //wire method to get recordType Id for Liability object
    @wire(getObjectInfo, { objectApiName: LIABILITY_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Credit Cards');

        } else if (error) {
            this.toastMessage(error.body.message, 'error');
        }
    }

    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    connectedCallback() {
        var creditData = [];

        if (undefined !== this.utillCmpObject.formUpdatedData['CreditCards'].length) {
            if (0 < this.utillCmpObject.formUpdatedData['CreditCards'].length) {
                this.utillCmpObject.formUpdatedData['CreditCards'].forEach((ele, rowindex) => {
                    ele['index'] = rowindex;
                    creditData.push(ele);
                })
                this.arrCreditCardData = creditData;

                if (0 < creditData.length) {
                    this.doYouHaveFlag = 'Yes';//making Yes as selected if creditData has values
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
        let arrIds = []; // To hold all record Ids

        if ('Yes' === event.detail) {
            this.addCredit();
        } else {

            if (0 !== this.arrCreditCardData.length) {
                //Collecting each record Id
                this.arrCreditCardData.forEach((ele, index) => {
                    if (ele.Id) {
                        arrIds.push(ele.Id);
                    }
                });

                //More than one id 
                if (1 < arrIds.length) {
                    this.utillCmpObject.formUpdatedData['Credit Cards'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: arrIds
                    });

                    this.dispatchEvent(deleteEvent);

                } else if (1 === arrIds.length) { // Only one Id
                    this.deleteCreditRecord(arrIds[0]);
                    this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
                    this.arrCreditCardData = [];

                    this.handleNext();

                } else { // No ids
                    this.arrCreditCardData = [];
                    this.handleNext();
                }
            } else {
                this.handleNext();
            }
        }
    }


    /* ======================================================== 
   * @method name : handleChange() 
   * @author : EY - Gupta 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    handleChange(event) {
        this.arrCreditCardData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.arrCreditCardData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.arrCreditCardData[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
    }


    /* ======================================================== 
    * @method name : addCredit() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    addCredit() {
        this.creditCardRecordObj['index'] = this.arrCreditCardData.length;
        var record = JSON.stringify(this.creditCardRecordObj);
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input']);

        if (pageValid) {
            this.arrCreditCardData.push(JSON.parse(record));
        }
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Gupta 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 event - Holds event data of firing form element
    ============================================================ */
    removeRecord(event) {
        this.removeCreditRecord(event.currentTarget.dataset.index)
        this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
    }


    /* ======================================================== 
    * @method name : removeCreditRecord() 
    * @author : EY - Gupta 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 index - holds index value of list
    ============================================================ */
    removeCreditRecord(index) {
        var deletedRecord = this.arrCreditCardData[index];

        if (deletedRecord.Id) {
            this.deleteCreditRecord(deletedRecord.Id);
        }

        this.arrCreditCardData.splice(index, 1);
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Gupta 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 recordId - holds recordId to delete
    ============================================================ */
    deleteCreditRecord(recordId) {
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
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleNext() {
        let pageValid = this.arrCreditCardData.length > 0 ? this.utillCmpObject.validations(this.template, ['lightning-input']) : true;
        if (pageValid) {
            this.arrCreditCardData.forEach(ele => {
                delete ele.index;
            });

            this.utillCmpObject.formUpdatedData['Credit Cards'] = this.arrCreditCardData;
            this.utillCmpObject.formUpdatedData['CreditCards'] = this.arrCreditCardData;

            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: LIABILITY_OBJECT.objectApiName
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