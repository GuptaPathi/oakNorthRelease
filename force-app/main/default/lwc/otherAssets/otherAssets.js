import { LightningElement,api,track,wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_AnyOtherAssetQue from '@salesforce/label/c.UI_Text_Label_AnyOtherAssetQue';
import UI_Input_Label_AssetDescription from '@salesforce/label/c.UI_Input_Label_AssetDescription';
import UI_Input_Label_AssetEstimation from '@salesforce/label/c.UI_Input_Label_AssetEstimation';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OTHER_ASSET_OBJECT from '@salesforce/schema/Other_Customer_Asset__c';

export default class OtherAssets extends LightningElement {

    // Private property Declaration
    @track doYouHaveFlag;
    @track otherAssetRecordObj={index:0,Asset_Description__c:'',Asset_Estimated_Value__c:''}
    @track lstIds=[];
    @track lstOtherAssetData = [];

   // Public property Declaration
    @api utillCmpObject;

    //Export Labels
    label = {
        UI_Text_Label_AnyOtherAssetQue,
        UI_Input_Label_AssetDescription,
        UI_Input_Label_AssetEstimation,
        UI_Button_Label_Next,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_AddAnother
    };

    //property that returns other assets length
    get showDeleteIcon(){
        return this.lstOtherAssetData.length > 1?true:false;
    }

    //property that returns other assets fields
    get showOtherAssetFields(){
        return this.lstOtherAssetData.length > 0?true:false;
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
           this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Other Assets');
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
    connectedCallback(){
        var otherAssetData = [];
        if(undefined !== this.utillCmpObject.formUpdatedData['OtherAssets'].length){
            if(this.utillCmpObject.formUpdatedData['OtherAssets'].length>0){
                this.utillCmpObject.formUpdatedData['OtherAssets'].forEach((ele,rowindex)=>{
                    ele['index']=rowindex;
                    otherAssetData.push(ele);
                })

                this.lstOtherAssetData = otherAssetData;
                    if(otherAssetData.length>0){
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
    handleDoYouHaveClick(event){
       if('Yes' === event.detail){
            this.addOtherAsset();
        }else{
            let lstIds=[]; // To hold all record Ids
            if(0 !== this.lstOtherAssetData.length){
                //Collecting each record Id
                this.lstOtherAssetData.forEach((ele,index)=>{
                    if(ele.Id){
                        lstIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(lstIds.length >1){
                    this.utillCmpObject.formUpdatedData['Other Assets'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: lstIds
                    });
                    this.dispatchEvent(deleteEvent);
                } else if(1 === lstIds.length){ // Only one Id
                    this.deleteOtherAssetRecord(lstIds[0]);
                    this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.lstOtherAssetData=[];
                    this.handleNext();
                } else { // No ids
                    this.lstOtherAssetData=[];
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
     this.lstOtherAssetData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
     this.lstOtherAssetData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
     this.lstOtherAssetData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
     this.otherAssetRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
     this.otherAssetRecordObj[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        
    }


    /* ======================================================== 
    * @method name : addOtherAsset() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addOtherAsset(){
        this.otherAssetRecordObj['index']=this.lstOtherAssetData.length;
        var record = JSON.stringify(this.otherAssetRecordObj);
        let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-textarea']); 
        if(pagevalid){
           this.lstOtherAssetData.push(JSON.parse(record));
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
        this.removeOtherAssetRecord(event.currentTarget.dataset.index)
        this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeOtherAssetRecord(index){
        var deletedRecord = this.lstOtherAssetData[index];
        if (deletedRecord.Id) {
           this.deleteOtherAssetRecord(deletedRecord.Id);
        }
        this.lstOtherAssetData.splice(index, 1);
        
    }

    deleteOtherAssetRecord(recordId){
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
        if(this.lstOtherAssetData.length > 0){
            pageValid = this.utillCmpObject.validations(this.template,['lightning-input','lightning-textarea']); 
        } 
        if(pageValid){
            this.lstOtherAssetData.forEach(ele=>{
                delete ele.index;
                
            });
            this.utillCmpObject.formUpdatedData['OtherAssets'] =  this.lstOtherAssetData;
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