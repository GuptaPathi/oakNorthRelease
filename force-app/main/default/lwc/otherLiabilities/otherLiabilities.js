import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_OtherContingentQue from '@salesforce/label/c.UI_Text_Label_OtherContingentQue';
import UI_Text_Label_OtherLiability from '@salesforce/label/c.UI_Text_Label_OtherLiability';
import UI_Input_Label_Details from '@salesforce/label/c.UI_Input_Label_Details';
import UI_Input_Label_OwingCurrentAmount from '@salesforce/label/c.UI_Input_Label_OwingCurrentAmount';
import UI_Input_Label_MonthlyRepaymentsLia from '@salesforce/label/c.UI_Input_Label_MonthlyRepaymentsLia';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LIABILITY_OBJECT from '@salesforce/schema/Liability__c';

export default class OtherLiabilities extends LightningElement {

    // Private property Declaration
    @track otherLiabilityRecordObj = {index: 0, Details__c: '', Amount_Currently_Owing__c: '', Monthly_Repayments__c: '' };
    @track lstIds = [];
    @track doYouHaveFlag;
    @track lstOtherContingentData = [];

    // Public property Declaration
    @api utillCmpObject;

    // Export labels
    label = {
        UI_Text_Label_OtherContingentQue,
        UI_Text_Label_OtherLiability,
        UI_Input_Label_Details,
        UI_Input_Label_OwingCurrentAmount,
        UI_Input_Label_MonthlyRepaymentsLia,
        UI_Text_Label_AddAnother,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Button_Label_Next
        
    };

    //property that returns deleted Other liability length
    get showDeleteIcon(){
        return this.lstOtherContingentData.length > 1?true:false;
    }

    //property that returns  Other liability fields
    get showOtherLiabilityFields(){
        return this.lstOtherContingentData.length > 0?true:false;
    }


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: LIABILITY_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Other Liabilities');

        } else if (error) {
            this.toastMessage(this.label.UI_Text_Label_Error, result.error.body.message, 'error');
        }
    }


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    connectedCallback() {
        var otherContingentData = [];
        if (undefined !== this.utillCmpObject.formUpdatedData['OtherLiabilities'].length) {
            if (this.utillCmpObject.formUpdatedData['OtherLiabilities'].length > 0) {
                this.utillCmpObject.formUpdatedData['OtherLiabilities'].forEach((ele, rowindex) => {
                    ele['index'] = rowindex;
                    otherContingentData.push(ele);
                })
                this.lstOtherContingentData = otherContingentData;

                if(otherContingentData.length>0){
                    this.doYouHaveFlag = 'Yes';
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
        if('Yes' === event.detail){
            this.addOtherLiability();
        }else{
            let lstIds=[]; // To hold all record Ids
            if(0 !== this.lstOtherContingentData.length){
                //Collecting each record Id
                this.lstOtherContingentData.forEach((ele,index)=>{
                    if(ele.Id){
                        lstIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(lstIds.length >1){
                    this.utillCmpObject.formUpdatedData['Other Liabilities'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: lstIds
                    });
                    this.dispatchEvent(deleteEvent);
                }else if(1 === lstIds.length){ // Only one Id
                    this.deleteOtherLiabilityRecord(lstIds[0]);
                    this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.lstOtherContingentData=[];
                    this.handleNext();
                }else{ // No ids
                    this.lstOtherContingentData=[];
                    this.handleNext();
                }
            }else{
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
        this.lstOtherContingentData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.lstOtherContingentData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.lstOtherContingentData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        this.otherLiabilityRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.otherLiabilityRecordObj[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
    }


    /* ======================================================== 
    * @method name : addOtherLiability() 
    * @author : EY - Ranjith 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    addOtherLiability() {
        this.otherLiabilityRecordObj['index'] = this.lstOtherContingentData.length;
        var record = JSON.stringify(this.otherLiabilityRecordObj);
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']);
        if (pageValid)
            this.lstOtherContingentData.push(JSON.parse(record));
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Ranjith 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 strAccountId - LoanId value
    * @return: event - Holds event data of firing form element.
    ============================================================ */
    removeRecord(event){
        this.removeOtherLiabilityRecord(event.currentTarget.dataset.index)
        this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeOtherLiabilityRecord(index){
        var deletedRecord = this.lstOtherContingentData[index];
        if (deletedRecord.Id) {
           this.deleteOtherLiabilityRecord(deletedRecord.Id);
        }
        this.lstOtherContingentData.splice(index, 1);
        
    }

    deleteOtherLiabilityRecord(recordId){
        deleteRecord(recordId)
        .then((ret) => {
           return 'success';
        })
        .catch(error => {
            this.toastMessage(this.label.UI_Text_Label_Error, error.body.message, 'error');
        });
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Ranjith 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleNext() {
        let pageValid = this.lstOtherContingentData.length>0?this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']):true;
        if (pageValid) {
            this.lstOtherContingentData.forEach(ele => {
                delete ele.index;
            });
            this.utillCmpObject.formUpdatedData['OtherLiabilities'] = this.lstOtherContingentData;
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