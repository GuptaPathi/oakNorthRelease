import { LightningElement,api,track,wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Section_Label_TaxDetails from '@salesforce/label/c.UI_Section_Label_TaxDetails';
import UI_Input_Label_Citizenship from '@salesforce/label/c.UI_Input_Label_Citizenship';
import UI_Input_Label_TIN from '@salesforce/label/c.UI_Input_Label_TIN';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_ErrDelRec from '@salesforce/label/c.UI_Text_Label_ErrDelRec';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CITIZENSHIP_OBJECT from '@salesforce/schema/Citizenship__c';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import CITIZENSHIP_COUNTRY_FIELD from '@salesforce/schema/Citizenship__c.Citizenship_Country__c';

export default class Taxdetails extends LightningElement {

    // Public property Declaration
    @api utillCmpObject;
    @api recordTypeId;

    // Private property Declaration
    @track lstIds=[];
    @track taxRecordData = {Citizenship_Country__c:'',Tax_Identification_Number__c:''};
    @track citizenshipList = [{index:0,Citizenship_Country__c:'',Tax_Identification_Number__c:''}];
    @track lstCountry;
    @track rows = [];
    hasRenderedCallbackDone=false;
    
    // Exporting labels
    label = {
        UI_Section_Label_TaxDetails,
        UI_Input_Label_Citizenship,
        UI_Input_Label_TIN,
        UI_Text_Label_AddAnother,
        UI_Text_Label_Success,
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_ErrDelRec,
        UI_Button_Label_Next
    };


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Sai Kumar 
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 25/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: CITIZENSHIP_OBJECT })
    getRecordTypeId({data,error}) {
        if(data){
            this.recordTypeId = data.defaultRecordTypeId;
   
        } else if (error) {
            this.toastMessage('Error', result.error.body.message, 'error');
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: CITIZENSHIP_COUNTRY_FIELD })
    wirePickList({data,error}){
        if(data){
           this.lstCountry = data.values;
          
        } else if(error) {
            this.toastMessage('Error', result.error.body.message, 'error');
        }
    }
    
    // citizenship list length limit to 5
    get citizenshipLimitFlag(){
      return (this.citizenshipList.length >4)?true:false;
    
    }

    // Removing the citizenship list
    get citizenshipRemoveFlag(){
        return (this.citizenshipList.length >1)?true:false; 
    }


    /* ======================================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    connectedCallback() {
       
    } 


    /* ======================================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Gupta 
    * @purpose: The renderedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    renderedCallback(){
        if(0 !== this.utillCmpObject.formUpdatedData['TaxDetails'].length && false === this.hasRenderedCallbackDone){
            this.hasRenderedCallbackDone = true;
     
        if(0 !== this.utillCmpObject.formUpdatedData['TaxDetails'].length){
            this.citizenshipList=[];
            this.utillCmpObject.formUpdatedData['TaxDetails'].forEach((ele,index)=>{
                if(-1 === this.lstIds.indexOf(ele.Id)){
                    var receivedData ={};
                    this.lstIds.push(ele.Id);
                    receivedData['index']=index;
                    receivedData['Id']=ele.Id;
                    receivedData['Citizenship_Country__c']=ele.Citizenship_Country__c;
                    receivedData['Tax_Identification_Number__c']=ele.Tax_Identification_Number__c;
                    this.citizenshipList.push(receivedData);
               }
            });
        }
    }
            
    }


   /* ==================================================================================== 
   * @method name : removeTaxDetails() 
   * @author : EY - Gupta 
   * @purpose: form element onclick event calls this method to remove alias data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */     
    removeTaxDetails(recordId) {
        this.isLoading = true;
        deleteRecord(recordId)
        then(() => {
            this.isLoading = false;
            this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
        })
        .catch(error => {
            this.toastMessage(this.label.UI_Text_Label_ErrDelRec, error.body.message, 'Error');

        });

    }

    removeCitizenship(event){
        var deletedRecord = this.citizenshipList[event.currentTarget.dataset.index];
        this.citizenshipList.splice(event.currentTarget.dataset.index,1);
        if(deletedRecord.Id){
            this.removeTaxDetails(deletedRecord.Id);
        } else {
            this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
        }
    }
    


   /* ==================================================================================== 
   * @method name : handleChange() 
   * @author : EY - Gupta 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */ 
    handleChange(event) {
        this.citizenshipList[event.currentTarget.dataset.index][event.target.name]=event.target.value;
        this.citizenshipList[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
    }
    

   /* ==================================================================================== 
   * @method name : addCitizenship() 
   * @author : EY - Gupta 
   * @purpose: form element onclick  event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   ========================================================================================= */ 
    addCitizenship(){
       this.taxRecordData['index']=this.citizenshipList.length;
        var record = JSON.stringify(this.taxRecordData);
        let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-combobox']); 
        if(pagevalid){
            this.citizenshipList.push(JSON.parse(record));
        }
        
    }


    /* ======================================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleNext(){
       let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-combobox']); 
       if(pagevalid){
        this.citizenshipList.forEach(ele=>{
            delete ele.index;
        });
        
        this.utillCmpObject.formUpdatedData['TaxDetails'] = this.citizenshipList;
        const nextEvent = new CustomEvent('nextpage', {
            bubbles: true,
            composed: true,
            detail: CITIZENSHIP_OBJECT.objectApiName
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