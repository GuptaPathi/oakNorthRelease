/* ======================================================== 
* @template name : business.js 
* @author : EY - Ranjith 
* @purpose: This html file holds all business records data.
* @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement,api,track,wire} from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_DoYouOwnBusinessQue from '@salesforce/label/c.UI_Text_Label_DoYouOwnBusinessQue';
import UI_Text_Label_SignificantPartnership from '@salesforce/label/c.UI_Text_Label_SignificantPartnership';
import UI_Input_Label_LegalBusinessName from '@salesforce/label/c.UI_Input_Label_LegalBusinessName';
import UI_Input_Label_ComNumber from '@salesforce/label/c.UI_Input_Label_ComNumber';
import UI_Input_Label_EstCountry from '@salesforce/label/c.UI_Input_Label_EstCountry';
import UI_Input_Label_EstBusinessValue from '@salesforce/label/c.UI_Input_Label_EstBusinessValue';
import UI_Input_Label_OwningPerQue from '@salesforce/label/c.UI_Input_Label_OwningPerQue';
import UI_Input_Label_AnnualSalary from '@salesforce/label/c.UI_Input_Label_AnnualSalary';
import UI_Text_Label_DivDisQue from '@salesforce/label/c.UI_Text_Label_DivDisQue';
import UI_Input_Label_AnnualReceivingsQue from '@salesforce/label/c.UI_Input_Label_AnnualReceivingsQue';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Button_Label_AddAnotherBusiness from '@salesforce/label/c.UI_Button_Label_AddAnotherBusiness';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ASSET_OBJECT from '@salesforce/schema/Customer_Assets__c';

export default class BusinessPage extends LightningElement {

    // Private property Declaration
    @track arrCountry=[]
    @track doYouHaveFlag;
    @track strRecordTypeId;
    @track businessRecordObj={index:0,
                                Select_Country_Of_Establishment__c:'',
                                Full_Legal_Trading_Name_Of_The_Business__c:'',
                                Company_Number__c:'',
                                Estimated_Value_Of_Business__c:'',
                                Business_Owning__c:'',
                                Annual_Salary__c:'',
                                Amount_Received_Annually__c:'',
                                Dividends_Received__c:'',
                                };

    @track arrBusinessData = []

    // Public property Declaration
    @api utillCmpObject

    //exporting lables
    label = {
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_DoYouOwnBusinessQue,
        UI_Text_Label_SignificantPartnership,
        UI_Input_Label_LegalBusinessName,
        UI_Input_Label_ComNumber,
        UI_Input_Label_EstCountry,
        UI_Input_Label_EstBusinessValue,
        UI_Input_Label_OwningPerQue,
        UI_Input_Label_AnnualSalary,
        UI_Text_Label_DivDisQue,
        UI_Input_Label_AnnualReceivingsQue,
        UI_Button_Label_Next,
        UI_Button_Label_AddAnotherBusiness
        
    };

    //property to get radio button options
    get options() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' },
        ];
    }

    //property to show/hide delete icon display
    get showDeleteIcon(){
        return this.arrBusinessData.length > 1?true:false;
    }

    //property to show/hide business fields  
    get showBusinessFields(){
        return this.arrBusinessData.length > 0?true:false;
    }

    //wired to get recordTypeId for Customer Asset object
    @wire(getObjectInfo, { objectApiName: ASSET_OBJECT })
        getRecordTypeId({data,error}) {
        if(data){
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Business');

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
    connectedCallback(){
        this.arrCountry = [...this.utillCmpObject.countryPickList];
        var businessData = [];

        if(0 < this.utillCmpObject.formUpdatedData['Business'].length){
            this.utillCmpObject.formUpdatedData['Business'].forEach((ele,rowindex)=>{
                ele['index'] = rowindex;
                ele['radioFlag'] = ele['Dividends_Received__c'] === 'Yes' ? true : false;
                businessData.push(ele);
            })

            this.arrBusinessData = businessData;

            if(0 < businessData.length){
                this.doYouHaveFlag = 'Yes';
            }
        }
        
    } 


    /* ======================================================== 
    * @method name : handleDoYouHaveClick() 
    * @author : EY - Gupta 
    * @purpose: this method handles Yes or No radio button group
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleDoYouHaveClick(event){
        if('Yes' === event.detail){
            this.addBusiness();
        } else {
        let arrIds=[]; // To hold all record Ids
        if(0 !== this.arrBusinessData.length){
            //Collecting each record Id
            this.arrBusinessData.forEach((ele,index)=>{
                if(ele.Id){
                    arrIds.push(ele.Id);
                }
            });

            //More than one id 
            if(1 < arrIds.length){
                this.utillCmpObject.formUpdatedData['Business'] = [];
                const deleteEvent = new CustomEvent('deleterecord', {
                    bubbles: true,
                    composed: true,
                    detail: arrIds
                });
                this.dispatchEvent(deleteEvent);

            } else if(1 === arrIds.length){ // Only one Id
                this.deleteBusinessRecord(arrIds[0]);
                this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
                this.arrBusinessData=[];
                this.handleNext();

            } else { // No ids
                this.arrBusinessData=[];
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
                this.arrBusinessData[event.currentTarget.dataset.index][event.currentTarget.dataset.name] = event.detail.value;
                this.arrBusinessData[event.currentTarget.dataset.index]['radioFlag'] = event.target.value=='Yes'?true:false;
            } else {
                this.arrBusinessData[event.currentTarget.dataset.index][event.target.name] = event.target.value; 
            }
                if('No' === event.target.value){
                this.arrBusinessData[event.currentTarget.dataset.index]['Amount_Received_Annually__c'] ='';
                
            } 
            this.arrBusinessData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
            this.arrBusinessData[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;  
    }


    /* ======================================================== 
    * @method name : addBusiness() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addBusiness(){
        this.businessRecordObj['index']=this.arrBusinessData.length;
        var record = JSON.stringify(this.businessRecordObj);
        let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-combobox','lightning-radio-group']); 

        if(pagevalid){
            this.arrBusinessData.push(JSON.parse(record));            
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
    removeBusiness(event){
        this.removeBusinessRecord(event.currentTarget.dataset.index)
        this.toastMessage('Success', label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeBusinessRecord(index){
        var deletedRecord = this.arrBusinessData[index];

        if (deletedRecord.Id) {
            this.deleteBusinessRecord(deletedRecord.Id);
        }
        this.arrBusinessData.splice(index, 1);
        
    }

    deleteBusinessRecord(recordId){
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
    handleNext(){
        let pagevalid= true;
        if(0 < this.arrBusinessData.length){
            pagevalid = this.utillCmpObject.validations(this.template,['lightning-input','lightning-combobox','lightning-radio-group']); 
        }
        if(pagevalid){
            this.arrBusinessData.forEach(ele=>{
                delete ele.index;
                delete ele.radioFlag;
            });
            this.utillCmpObject.formUpdatedData['Business'] =  this.arrBusinessData;
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