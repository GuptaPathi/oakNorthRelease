import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_WealthLegalArraQue from '@salesforce/label/c.UI_Text_Label_WealthLegalArraQue';
import UI_Text_Label_PrivateTrustEx from '@salesforce/label/c.UI_Text_Label_PrivateTrustEx';
import UI_Text_Label_WealthHelsTrust from '@salesforce/label/c.UI_Text_Label_WealthHelsTrust';
import UI_Input_Label_TrustLegalName from '@salesforce/label/c.UI_Input_Label_TrustLegalName';
import UI_Input_Label_EstValueQue from '@salesforce/label/c.UI_Input_Label_EstValueQue';
import UI_Input_Label_EstCountry from '@salesforce/label/c.UI_Input_Label_EstCountry';
import UI_Text_Label_DivDisQue from '@salesforce/label/c.UI_Text_Label_DivDisQue';
import UI_Input_Label_AnnualReceivingsQue from '@salesforce/label/c.UI_Input_Label_AnnualReceivingsQue';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ASSET_OBJECT from '@salesforce/schema/Customer_Assets__c';


export default class Trusts extends LightningElement {

    // Private property Declaration
    @track recordTypeId;
    @track assetRecordObj = { Select_Country_Of_Establishment__c: '', Full_Legal_Name_Of_the_Trust__c: '', Estimated_Current_Value__c: '', Amount_Received_Annually__c: '',Dividends_Received__c:'' };
    @track doYouHaveFlag;
    @track lstIds = [];
    @track lstTrustData = [];

   // Public property Declaration
    @api utillCmpObject;

   // Exporting labels
    label = {
        UI_Text_Label_WealthLegalArraQue,
        UI_Text_Label_PrivateTrustEx,
        UI_Text_Label_WealthHelsTrust,
        UI_Input_Label_TrustLegalName,
        UI_Input_Label_EstValueQue,
        UI_Input_Label_EstCountry,
        UI_Text_Label_DivDisQue,
        UI_Input_Label_AnnualReceivingsQue,
        UI_Text_Label_AddAnother,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Button_Label_Next
    };

    //property that returns options 
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    //property that returns deleted trust length 
    get showDeleteIcon(){
        return this.lstTrustData.length > 1?true:false;
    }

    //property that returns  trust fields 
    get showTrustFields(){
        return this.lstTrustData.length > 0?true:false;
    }


    /* ======================================================================== 
    * method name : wire() 
    * author : EY - Gupta 
    * purpose: wire method to get files related logged in user relationShipID
    * created date (dd/mm/yyyy) : 20/08/2020
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: ASSET_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Trust');

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
        this.lstCountry = [...this.utillCmpObject.countryPickList];
        var trustData = [];
        if(undefined !== this.utillCmpObject.formUpdatedData['Trust'].length){
        if (this.utillCmpObject.formUpdatedData['Trust'].length > 0) {
            this.utillCmpObject.formUpdatedData['Trust'].forEach((ele, rowindex) => {
                ele['index'] = rowindex;
                ele['radioFlag']=ele['Dividends_Received__c']=='Yes'?true:false;
                trustData.push(ele);
               
            })
            this.lstTrustData = trustData;
            if(trustData.length>0){
                this.doYouHaveFlag='Yes';
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
            this.addTrust();
        } else {
           
        let lstIds = []; // To hold all record Ids
        if(0 !== this.lstTrustData.length){
            //Collecting each record Id
            this.lstTrustData.forEach((ele,index)=>{
                if(ele.Id){
                    lstIds.push(ele.Id);
                }
            });

            //More than one id 
            if(lstIds.length >1){
                this.utillCmpObject.formUpdatedData['Trust'] = [];
                const deleteEvent = new CustomEvent('deleterecord', {
                    bubbles: true,
                    composed: true,
                    detail: lstIds
                });
                this.dispatchEvent(deleteEvent);
            } else if(1 === lstIds.length){ // Only one Id
                this.deleteTrustRecord(lstIds[0]);
                this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                this.lstTrustData=[];
                this.handleNext();
            } else { // No ids
                this.lstTrustData=[];
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
        if('LIGHTNING-RADIO-GROUP' === event.target.nodeName){
            this.lstTrustData[event.currentTarget.dataset.index][event.currentTarget.dataset.name] = event.detail.value;
            this.lstTrustData[event.currentTarget.dataset.index]['radioFlag'] = event.target.value=='Yes'?true:false;
        }else{
            this.lstTrustData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
     
        } if('No' === event.target.value){
            this.lstTrustData[event.currentTarget.dataset.index]['Amount_Received_Annually__c'] ='';
            
        } 
        this.lstTrustData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        this.lstTrustData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
    }

    /* ======================================================== 
    * @method name : addTrust() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addTrust() {
        this.assetRecordObj['index'] = this.lstTrustData.length;
        var record = JSON.stringify(this.assetRecordObj);
        let pagevalid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-combobox', 'lightning-radio-group']);
        if (pagevalid) {
            this.lstTrustData.push(JSON.parse(record));
            
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
    removeRecord(event){
        this.removeTrustRecord(event.currentTarget.dataset.index)
        this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeTrustRecord(index){
        var deletedRecord = this.lstTrustData[index];
        if (deletedRecord.Id) {
           this.deleteTrustRecord(deletedRecord.Id);
        }
        this.lstTrustData.splice(index, 1);
    }

    deleteTrustRecord(recordId){
        deleteRecord(recordId)
        .then((ret) => {
           return 'success';
        })
        .catch(error => {
            this.toastMessage(his.label.UI_Text_Label_Error, error.body.message, 'error');
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
        if(this.lstTrustData.length > 0){
            pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-radio-group', 'lightning-combobox']);
        }
        if (pageValid) {
            this.lstTrustData.forEach(ele => {
                delete ele.index;
                delete ele.radioFlag;
            });
            
            this.utillCmpObject.formUpdatedData['Trust'] = this.lstTrustData;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: ASSET_OBJECT.objectApiName
            });
            this.dispatchEvent(nextEvent); 
        }
    }


    /* ======================================================================== 
    * @method name : toastMessage() 
    * @author : EY - Sai Kumar
    * @purpose:toast message utility
    * @created date (dd/mm/yyyy) : 25/08/2020 
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