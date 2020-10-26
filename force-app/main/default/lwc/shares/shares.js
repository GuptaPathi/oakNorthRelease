import { LightningElement,api,track,wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_SharesSignificantQue from '@salesforce/label/c.UI_Text_Label_SharesSignificantQue';
import UI_Text_Label_PEPSTrust from '@salesforce/label/c.UI_Text_Label_PEPSTrust';
import UI_Input_Label_EntityLegalName from '@salesforce/label/c.UI_Input_Label_EntityLegalName';
import UI_Input_Label_EstCountry from '@salesforce/label/c.UI_Input_Label_EstCountry';
import UI_Input_Label_EstSharesValue from '@salesforce/label/c.UI_Input_Label_EstSharesValue';
import UI_Input_Label_AnnualReceivingsQue from '@salesforce/label/c.UI_Input_Label_AnnualReceivingsQue';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_DivDisQue from '@salesforce/label/c.UI_Text_Label_DivDisQue';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_SharesDet from '@salesforce/label/c.UI_Text_Label_SharesDet';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OTHER_ASSET_OBJECT from '@salesforce/schema/Other_Customer_Asset__c';


export default class Shares extends LightningElement {

    // Private property Declaration
    @track shareRecordObj={index:0,Select_Country_Of_Establishment__c:'',Full_Legal_Name_Of_Entity__c:'',Estimated_Value_Of_Shares__c:'',Amount_Received_Annually__c:''}
    @track doYouHaveFlag;
    @track lstIds=[];
    @track lstSharesData = [];

    // Public property Declaration
    @api utillCmpObject;

    // Exporting labels
    label = {
        UI_Text_Label_SharesSignificantQue,
        UI_Text_Label_PEPSTrust,
        UI_Input_Label_EntityLegalName,
        UI_Input_Label_EstCountry,
        UI_Input_Label_EstSharesValue,
        UI_Text_Label_DivDisQue,
        UI_Input_Label_AnnualReceivingsQue,
        UI_Text_Label_AddAnother,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_SharesDet,
        UI_Button_Label_Next
        
    };

    //property that returns selected options
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    //property that returns deleted share length
    get showDeleteIcon(){
        return this.lstSharesData.length > 1?true:false;
    }

    //property that returns  share fields 
    get showShareFields(){
        return this.lstSharesData.length > 0?true:false;
    }


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: OTHER_ASSET_OBJECT })
        getRecordTypeId({data,error}) {
            if(data){
                const rtis = data.recordTypeInfos;
                this.recordTypeId =  Object.keys(rtis).find(rti => rtis[rti].name === 'Shares');
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
        var shareData = [];       
            if (this.utillCmpObject.formUpdatedData['Shares'].length > 0) { 
                this.utillCmpObject.formUpdatedData['Shares'].forEach((ele, rowindex) => {     
                ele['index'] = rowindex;
                ele['radioFlag']=ele['Dividends_Received__c']=='Yes'?true:false;
                    shareData.push(ele);          
                    })         
                    this.lstSharesData = shareData;
                    if(shareData.length>0){
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
    handleDoYouHaveClick(event){
        if('Yes' === event.detail){
            this.addShare();
        } else {
            let lstIds=[]; // To hold all record Ids
            if(0 !== this.lstSharesData.length){
                //Collecting each record Id
                this.lstSharesData.forEach((ele,index)=>{
                    if(ele.Id){
                        lstIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(lstIds.length >1){
                    this.utillCmpObject.formUpdatedData['Shares'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: lstIds
                    });
                    this.dispatchEvent(deleteEvent);
                } else if(1 === lstIds.length){ // Only one Id
                    this.deleteShareRecord(lstIds[0]);
                    this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.lstSharesData=[];
                    this.handleNext();
                } else { // No ids
                    this.lstSharesData=[];
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
    handleChange(event){
        if('LIGHTNING-RADIO-GROUP' === event.target.nodeName){
            this.lstSharesData[event.currentTarget.dataset.index][event.currentTarget.dataset.name] = event.detail.value;
            this.lstSharesData[event.currentTarget.dataset.index]['radioFlag'] = event.target.value=='Yes'?true:false;
        }else{
            this.lstSharesData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        }
        if('No' === event.target.value){
            this.lstSharesData[event.currentTarget.dataset.index]['Amount_Received_Annually__c'] ='';
            
        } 
        this.lstSharesData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.lstSharesData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        
    }


    /* ======================================================== 
    * @method name : addShare() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addShare(){
        this.shareRecordObj['index']=this.lstSharesData.length;
        var record = JSON.stringify(this.shareRecordObj);
        let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-combobox','lightning-radio-group']); 
        if(pagevalid){
            this.lstSharesData.push(JSON.parse(record));
            
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
        this.removeShareRecord(event.currentTarget.dataset.index)
        this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeShareRecord(index){
        var deletedRecord = this.lstSharesData[index];
        if (deletedRecord.Id) {
           this.deleteShareRecord(deletedRecord.Id);
        }
        this.lstSharesData.splice(index, 1);
        
    }

    deleteShareRecord(recordId){
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
    handleNext(){
        let pageValid = true;
        if(this.lstSharesData.length > 0){
            pageValid = this.utillCmpObject.validations(this.template,['lightning-input','lightning-radio-group','lightning-combobox']); 
        } 
        if(pageValid){
            this.lstSharesData.forEach(ele=>{
                delete ele.index;
                delete ele.radioFlag;
            });
            this.utillCmpObject.formUpdatedData['Shares'] =  this.lstSharesData;
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