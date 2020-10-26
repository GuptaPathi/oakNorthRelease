/*======================================================== 
* @template name : contingentLiabilities.js 
* @author : EY - Ranjith 
* @purpose: This html file holds all contingentLiabilitiy records data.
* @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/

import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_ContingentQue from '@salesforce/label/c.UI_Text_Label_ContingentQue';
import UI_Text_Label_ContingentDetails from '@salesforce/label/c.UI_Text_Label_ContingentDetails';
import UI_Input_Label_GuaranteeAmount from '@salesforce/label/c.UI_Input_Label_GuaranteeAmount';
import UI_Input_Label_OrganisationName from '@salesforce/label/c.UI_Input_Label_OrganisationName';
import UI_Input_Label_3rdPartyName from '@salesforce/label/c.UI_Input_Label_3rdPartyName';
import UI_Input_Label_ContingentTimeLimit from '@salesforce/label/c.UI_Input_Label_ContingentTimeLimit';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LIABILITY_OBJECT from '@salesforce/schema/Liability__c';

export default class ContingentLiabilities extends LightningElement {

    //declaring private variables
    @track contingentRecordObj = {index: 0, Third_Party_Name__c: '', To_Whom__c: '', Amount__c: '', Contingent_Liability_Time_Limit__c:'' };
    @track arrIds = [];
    @track doYouHaveFlag;
    @track arrContingentData = [];
    @track strRecordTypeId;

    //declaring public variables
    @api utillCmpObject;
    
    //exporting labels
    label = {
        UI_Text_Label_ContingentQue,
        UI_Text_Label_ContingentDetails,
        UI_Input_Label_GuaranteeAmount,
        UI_Input_Label_OrganisationName,
        UI_Input_Label_3rdPartyName,
        UI_Input_Label_ContingentTimeLimit,
        UI_Button_Label_Next,
        UI_Text_Label_AddAnother,
        UI_Text_Label_DeleteSucess
        
    };
    
    //property to show/hide delete icon
    get showDeleteIcon(){
        return this.arrContingentData.length > 1?true:false;
    }

    //property to show/hide contingent liabilities
    get showContingentFields(){
        return this.arrContingentData.length > 0?true:false;
    }
    
    //wired to get recordType id of Liability object
    @wire(getObjectInfo, { objectApiName: LIABILITY_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Contigent Liabilities');

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
        var contingentData = [];

        if (undefined !== this.utillCmpObject.formUpdatedData['ContigentLiabilities'].length) {

            if (0 < this.utillCmpObject.formUpdatedData['ContigentLiabilities'].length) {
                this.utillCmpObject.formUpdatedData['ContigentLiabilities'].forEach((ele, rowindex) => {
                    ele['index'] = rowindex;
                    contingentData.push(ele);
                });
                this.arrContingentData = contingentData;

                if(0 < contingentData.length){
                    this.doYouHaveFlag = 'Yes';
                }
            }
        }
    }

    
    /* ======================================================== 
    * @method name : handleDoYouHaveClick() 
    * @author : EY - Ranjith 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleDoYouHaveClick(event) {

        if('Yes' === event.detail){
            this.addContingent();
        } else {
            let arrIds=[]; // To hold all record Ids
            if(0 !== this.arrContingentData.length){
                //Collecting each record Id
                this.arrContingentData.forEach((ele,index)=>{
                    if(ele.Id){
                        arrIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(1 < arrIds.length){
                    this.utillCmpObject.formUpdatedData['Contigent Liabilities'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: arrIds
                    });

                    this.dispatchEvent(deleteEvent);

                } else if(1 === arrIds.length){ // Only one Id
                    this.deleteContingentRecord(arrIds[0]);
                    this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
                    this.arrContingentData=[];

                    this.handleNext();
                    
                } else { // No ids
                    this.arrContingentData=[];

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
        this.arrContingentData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.arrContingentData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.arrContingentData[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
        this.contingentRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.contingentRecordObj[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
    }


    /* ======================================================== 
    * @method name : addContingent() 
    * @author : EY - Ranjith 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addContingent() {
        this.contingentRecordObj['index'] = this.arrContingentData.length;
        var record = JSON.stringify(this.contingentRecordObj);
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-combobox']);
        
        if (pageValid) {
             this.arrContingentData.push(JSON.parse(record));
        }  
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
        this.removeContingentRecord(event.currentTarget.dataset.index);

        this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeContingentRecord(index){
        var deletedRecord = this.arrContingentData[index];
        if (deletedRecord.Id) {
           this.deleteContingentRecord(deletedRecord.Id);
        }
        this.arrContingentData.splice(index, 1);
        
    }

    deleteContingentRecord(recordId){
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
        let pageValid = this.arrContingentData.length>0?this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-combobox']):true; 
        if (pageValid) {
            this.arrContingentData.forEach(ele => {
                delete ele.index;
            });
            this.utillCmpObject.formUpdatedData['ContigentLiabilities'] = this.arrContingentData;
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