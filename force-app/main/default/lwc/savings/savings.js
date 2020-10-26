import { LightningElement, track, api, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_CashSavingsQue from '@salesforce/label/c.UI_Text_Label_CashSavingsQue';
import UI_Text_Label_CashSavings from '@salesforce/label/c.UI_Text_Label_CashSavings';
import UI_Input_Label_EstSavingsValue from '@salesforce/label/c.UI_Input_Label_EstSavingsValue';
import UI_Text_Label_SavingsGenerationsQue from '@salesforce/label/c.UI_Text_Label_SavingsGenerationsQue';
import UI_Input_Label_BusinessTrade from '@salesforce/label/c.UI_Input_Label_BusinessTrade';
import UI_Input_Label_BusinessTradeDetails from '@salesforce/label/c.UI_Input_Label_BusinessTradeDetails';
import UI_Input_Label_Inheritance from '@salesforce/label/c.UI_Input_Label_Inheritance';
import UI_Input_Label_InheritanceDetails from '@salesforce/label/c.UI_Input_Label_InheritanceDetails';
import UI_Input_Label_PropertySafe from '@salesforce/label/c.UI_Input_Label_PropertySafe';
import UI_Input_Label_PropSafeDetails from '@salesforce/label/c.UI_Input_Label_PropSafeDetails';
import UI_Input_Label_CompBusinessSale from '@salesforce/label/c.UI_Input_Label_CompBusinessSale';
import UI_Input_Label_CompBusinessSaleDetails from '@salesforce/label/c.UI_Input_Label_CompBusinessSaleDetails';
import UI_Input_Label_Lifepolicies from '@salesforce/label/c.UI_Input_Label_Lifepolicies';
import UI_Input_Label_LifePoliciesDetails from '@salesforce/label/c.UI_Input_Label_LifePoliciesDetails';
import UI_Input_Label_Gift from '@salesforce/label/c.UI_Input_Label_Gift';
import UI_Input_Label_GiftDetails from '@salesforce/label/c.UI_Input_Label_GiftDetails';
import UI_Input_Label_SaleOfShare from '@salesforce/label/c.UI_Input_Label_SaleOfShare';
import UI_Input_Label_SaleOfShareDetails from '@salesforce/label/c.UI_Input_Label_SaleOfShareDetails';
import UI_Input_Label_EmplIncome from '@salesforce/label/c.UI_Input_Label_EmplIncome';
import UI_Input_Label_EmplIncomeDetails from '@salesforce/label/c.UI_Input_Label_EmplIncomeDetails';
import UI_Input_Label_Other from '@salesforce/label/c.UI_Input_Label_Other';
import UI_Input_Label_OtherDetails from '@salesforce/label/c.UI_Input_Label_OtherDetails';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OTHER_ASSET_OBJECT from '@salesforce/schema/Other_Customer_Asset__c';

export default class Savings extends LightningElement {

    // Private property Declaration
    @track strAtleastOneSavingError = 'Select Atleast one option below';
    @track checkedLabelList = [];
    @track doYouHaveFlag;
    @track checkGroup = {Business_Trade_Details__c: false, Inheritance_Details__c: false, Property_Sales_Details__c: false, Property_Sales_Details__c: false, Company_Business_Sales_Details__c: false, Maturity_Life_Policies_Details__c: false, Gift_Details__c: false, Sale_Of_Share_Details__c: false, Employment_Income_Details__c: false, Other_Details__c: false };
    @track savingRecordObj = { index: 0, Estimated_Value_Of_Savings__c: '', Business_Trade_Details__c: '', Inheritance_Details__c: '', Property_Sales_Details__c: '', Property_Sales_Details__c: '', Company_Business_Sales_Details__c: '', Maturity_Life_Policies_Details__c: '', Gift_Details__c: '', Sale_Of_Share_Details__c: '', Employment_Income_Details__c: '', Other_Details__c: '' };
    @track lstSavingsData = [];
    @track value = [];

    // Exporting labels
    label = {
        UI_Text_Label_CashSavingsQue,
        UI_Text_Label_CashSavings,
        UI_Input_Label_EstSavingsValue,
        UI_Text_Label_SavingsGenerationsQue,
        UI_Input_Label_BusinessTrade,
        UI_Input_Label_BusinessTradeDetails,
        UI_Input_Label_Inheritance,
        UI_Input_Label_InheritanceDetails,
        UI_Input_Label_PropertySafe,
        UI_Input_Label_PropSafeDetails,
        UI_Input_Label_CompBusinessSale,
        UI_Input_Label_CompBusinessSaleDetails,
        UI_Input_Label_Lifepolicies,
        UI_Input_Label_LifePoliciesDetails,
        UI_Input_Label_Gift,
        UI_Input_Label_GiftDetails,
        UI_Input_Label_SaleOfShare,
        UI_Input_Label_SaleOfShareDetails,
        UI_Input_Label_EmplIncome,
        UI_Input_Label_EmplIncomeDetails,
        UI_Input_Label_Other,
        UI_Input_Label_OtherDetails,
        UI_Text_Label_AddAnother,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Button_Label_Next
        
    };

    // Public property Declaration
    @api utillCmpObject;

    //property that returns deleted savings length
    get showDeleteIcon() {
        return this.lstSavingsData.length > 1 ? true : false;
    }

    //property that returns  display of savings fields
    get showSavingsFields() {
        return this.lstSavingsData.length > 0 ? true : false;
    }


     /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: OTHER_ASSET_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Savings');

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
        var saveData = [];
        if (this.utillCmpObject.formUpdatedData['Savings'].length > 0) {
            this.utillCmpObject.formUpdatedData['Savings'].forEach((ele, rowindex) => {
                ele['index'] = rowindex;
                saveData.push(ele);
            })
            saveData.forEach(record => {
                var chk={}
                Object.keys(record).forEach(element => {
                    if (undefined !== record[element] && null !== record[element] && '' !== record[element]){
                        chk[element] = true;
                    }else{
                        chk[element] = false;
                    }
                });
                record['checkGroup']=chk;
            })

            this.lstSavingsData = saveData;
            if (saveData.length > 0) {
                this.doYouHaveFlag = 'Yes';
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
            this.addSavings();
        } else {
            let lstIds=[]; // To hold all record Ids
            if(0 !== this.lstSavingsData.length){
                //Collecting each record Id
                this.lstSavingsData.forEach((ele,index)=>{
                    if(ele.Id){
                        lstIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(lstIds.length >1){
                    this.utillCmpObject.formUpdatedData['Savings'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: lstIds
                    });
                    this.dispatchEvent(deleteEvent);
                } else if(1 === lstIds.length){ // Only one Id
                    this.deleteSavingRecord(lstIds[0]);
                    this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.lstSavingsData=[];
                    this.handleNext();
                } else { // No ids
                    this.lstSavingsData=[];
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
        this.lstSavingsData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.lstSavingsData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.lstSavingsData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        this.savingRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.savingRecordObj[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;

    }


    /* ======================================================== 
   * @method name : handleClick() 
   * @author : EY - Gupta 
   * @purpose: form element onclick event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */ 
    handleClick(event) {
        this.lstSavingsData[event.currentTarget.dataset.index]['checkGroup'][event.target.name] =  event.target.checked;
        this.lstSavingsData[event.currentTarget.dataset.index][event.target.name] =  event.target.checked?this.lstSavingsData[event.currentTarget.dataset.index][event.target.name]:'';
    }


    /* ======================================================== 
    * @method name : addSavings() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addSavings() {
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']);
        var atleastVal = this.handleAtleastOneSelection(); 
       if(pageValid && atleastVal){
            this.savingRecordObj['index'] = this.lstSavingsData.length;
            this.savingRecordObj['checkGroup'] =this.checkGroup;
            var record = JSON.stringify(this.savingRecordObj);
            let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']);
            if (pageValid) {
                this.lstSavingsData.push(JSON.parse(record));
            }

            this.template.querySelector('.'+this.lstSavingsData.length-1).scrollIntoView();
        }
        
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Gupta 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 strAccountId - LoanId value
    * @return: event - Holds event data of firing form element.
    ============================================================ */ 
    removeRecord(event) {
        this.removeSavingsRecord(event.currentTarget.dataset.index)
        this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeSavingsRecord(index) {
        var deletedRecord = this.lstSavingsData[index];
        if (deletedRecord.Id) {
            this.deleteSavingRecord(deletedRecord.Id);
        }
        this.lstSavingsData.splice(index, 1);

    }

    deleteSavingRecord(recordId) {
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
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleNext() {
        let pageValid = true;
        if (this.lstSavingsData.length > 0) {
            pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']);
        }
        var atleastVal = this.handleAtleastOneSelection();
        if (pageValid && atleastVal) {
            let jsonData = JSON.stringify(this.lstSavingsData);
            let saveData = JSON.parse(jsonData);
            saveData.forEach(ele => {
                delete ele.index;
                delete ele.checkGroup;
                delete ele.bolSavingError;
            });
            this.utillCmpObject.formUpdatedData['Savings'] = saveData;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: OTHER_ASSET_OBJECT.objectApiName
            });
            this.dispatchEvent(nextEvent);
        }
    }


    /* ======================================================== 
    * @method name : handleAtleastOneSelection() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleAtleastOneSelection(){
        var isRecordValid=true;
        var bolEachRecord;
        var lstCheckBox=[];
        this.lstSavingsData.forEach(eleSaveRecord=>{
            bolEachRecord=false;
            lstCheckBox = eleSaveRecord['checkGroup'];
            Object.keys(this.checkGroup).forEach(checkBox=>{
                if(eleSaveRecord.checkGroup[checkBox]){
                    bolEachRecord = true;
                }
            });
            if(! bolEachRecord){
                eleSaveRecord.bolSavingError = true;
                isRecordValid = false;
            } else {
                eleSaveRecord.bolSavingError = false;
            }
        });
        return isRecordValid;
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