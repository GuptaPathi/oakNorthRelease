import { LightningElement,api,track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_Summary from '@salesforce/label/c.UI_Text_Label_Summary';
import UI_Section_Label_PI from '@salesforce/label/c.UI_Section_Label_PI';
import UI_Section_Label_AddressHistory from '@salesforce/label/c.UI_Section_Label_AddressHistory';
import UI_Text_Label_Citizenship from '@salesforce/label/c.UI_Text_Label_Citizenship';
import UI_Section_Label_AdditionalDetails from '@salesforce/label/c.UI_Section_Label_AdditionalDetails';
import UI_Text_Label_AdditiConfirm from '@salesforce/label/c.UI_Text_Label_AdditiConfirm';
import UI_Text_Label_AdditiQues from '@salesforce/label/c.UI_Text_Label_AdditiQues';
import UI_Section_Label_SupportingDocuments from '@salesforce/label/c.UI_Section_Label_SupportingDocuments';
import UI_Button_Label_Submit from '@salesforce/label/c.UI_Button_Label_Submit';
import UI_Text_Label_Name from '@salesforce/label/c.UI_Text_Label_Name';
import UI_Text_Label_DateOfBirth from '@salesforce/label/c.UI_Text_Label_DateOfBirth';
import UI_Text_Label_CountryOfBirth from '@salesforce/label/c.UI_Text_Label_CountryOfBirth';
import UI_Text_Label_NoPerInfoFound from '@salesforce/label/c.UI_Text_Label_NoPerInfoFound';
import UI_Text_Label_NoAddDetails from '@salesforce/label/c.UI_Text_Label_NoAddDetails';
import UI_Text_Label_NoTaxFound from '@salesforce/label/c.UI_Text_Label_NoTaxFound';
import UI_Text_Label_NoDocs from '@salesforce/label/c.UI_Text_Label_NoDocs';
import UI_Text_Label_YesLabel from '@salesforce/label/c.UI_Text_Label_YesLabel';
import UI_Text_Label_NoLabel from '@salesforce/label/c.UI_Text_Label_NoLabel';

import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class SummaryPage extends LightningElement {

    //declaration of public variables
     @api utillCmpObject;

    //declaration of private variables
     @track summaryDetails;
     @track files;
     @track addressHistoryData;
     @track summaryInfo;

    //Exporting labels
    label = {
        UI_Text_Label_Summary,
        UI_Section_Label_AddressHistory,
        UI_Text_Label_Citizenship,
        UI_Section_Label_AdditionalDetails,
        UI_Text_Label_AdditiQues,
        UI_Section_Label_SupportingDocuments,
        UI_Text_Label_AdditiConfirm,
        UI_Button_Label_Submit,
        UI_Text_Label_Name,
        UI_Text_Label_DateOfBirth,
        UI_Text_Label_CountryOfBirth,
        UI_Text_Label_NoPerInfoFound,
        UI_Text_Label_NoAddDetails,
        UI_Text_Label_NoTaxFound,
        UI_Text_Label_NoDocs,
        UI_Text_Label_YesLabel,
        UI_Text_Label_NoLabel,
        UI_Section_Label_PI
        
    };

    //property that returns AddressHistory
    get addressHistoryFlag(){
        return this.summaryDetails.AddressHistory.length>0?true:false;
    }

    //property that returns TaxDetails
    get taxDetailsFlag(){
        return this.summaryDetails.TaxDetails.length>0?true:false;
    }

    //property that returns AdditionalDetails
    get additionalFlag(){
        return this.summaryDetails.AdditionalDetails?true:false;
    }

    //property that returns Supporting Documents
    get supportingDocsFlag(){
        return this.files.length>0?true:false;
    }

    tileEditHandle(event){
        
    }

    /* ======================================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    connectedCallback(){
        if(undefined !== this.utillCmpObject.formUpdatedData['Summary']){
            this.summaryInfo = this.utillCmpObject.formUpdatedData['Summary'][0];  
        }
        
        this.summaryDetails = this.utillCmpObject.formUpdatedData;
        if(null !== this.summaryDetails.AddressHistory  && undefined !== this.summaryDetails.AddressHistory){
            this.handleAddressHistoryTime();
        }
        this.addressHistoryData=this.utillCmpObject.lstAddressHistory;
        this.files=this.utillCmpObject.uploadedFiles;
    }


    /* ======================================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Gupta 
    * @purpose: The renderedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    renderedCallback(){
        this.files=this.utillCmpObject.uploadedFiles;
        this.summaryDetails = this.utillCmpObject.formUpdatedData;
    }

    
    /* ======================================================================== 
    * @method name : handleEdit() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleEdit(event){
        this.utillCmpObject.summaryPageRecord =  this.summaryDetails[event.target.name];
            const editEvent = new CustomEvent('summarypageedit', {
            bubbles: true,
            composed: true,
            detail: event.target.name
        });
        this.dispatchEvent(editEvent);
    }


    /* ======================================================================== 
    * @method name : handleClick() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleClick(event){
        this.summaryInfo[event.target.name]=event.target.checked;
    }


    /* ======================================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleNext(event){
        let pagevalid = this.utillCmpObject.validations(this.template,['lightning-input']);
        this.utillCmpObject.formUpdatedData['Summary'][0]=this.summaryInfo;
       
        if(pagevalid){
        const editEvent = new CustomEvent('nextpage', {
        bubbles: true,
        composed: true,
        detail:ACCOUNT_OBJECT.objectApiName
            });
          this.dispatchEvent(editEvent);
        }
    }


    /* ======================================================================== 
    * @method name : handleAddressHistoryTime() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleAddressHistoryTime(){
        this.summaryDetails.AddressHistory = this.summaryDetails.AddressHistory.map(eachAddr => {
            if (undefined !== eachAddr.At_Address_Since__c) {

                var fromDate = new Date(eachAddr.At_Address_Since__c);
                var difDate;
                var dateDiffText;
                if (undefined === eachAddr.At_Address_Till_Date__c) {
                    eachAddr.Current__c = true;
                    difDate = new Date(new Date() - fromDate);
                    dateDiffText = eachAddr.At_Address_Since__c + ' - Present ';
                } else {
                    eachAddr.Current__c = false;
                    difDate = new Date(new Date(eachAddr.At_Address_Till_Date__c) - fromDate);
                    dateDiffText = eachAddr.At_Address_Since__c + ' to ' + eachAddr.At_Address_Till_Date__c;
                }
                var year = (difDate.toISOString().slice(0, 4) - 1970);
                var month = (difDate.getMonth());
                var yearsStr = year > 0 ? year == 1 ? year + ' Year ' : year + ' Years ' : '';
                var monthStr = month > 0 ? month == 1 ? month + ' Month ' : month + ' Months ' : '';
                var durationText = ' ( ' + yearsStr + monthStr + ' ) ';
                return { ...eachAddr, dateDiffTexts: dateDiffText, durationTxts: durationText };
            }

        });
    }
}