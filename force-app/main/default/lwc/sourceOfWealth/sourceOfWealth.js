import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_SourceOfWealthDesc from '@salesforce/label/c.UI_Text_Label_SourceOfWealthDesc';
import UI_Input_Label_SourceWealth from '@salesforce/label/c.UI_Input_Label_SourceWealth';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import OTHER_ASSET_OBJECT from '@salesforce/schema/Other_Customer_Asset__c';


export default class SourceOfWealth extends LightningElement {

    // Private property Declaration
    @track sourceOfWealthObj = { Source_Of_Wealth__c: '', Source_of_Wealth_Check__c: false };
    
    // Public property Declaration
    @api utillCmpObject;

    // Exporting labels
    label = {
        UI_Text_Label_SourceOfWealthDesc,
        UI_Input_Label_SourceWealth,
        UI_Text_Label_Error,
        UI_Button_Label_Next
    };


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 25/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: OTHER_ASSET_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Source Of Wealth');

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
        if (this.utillCmpObject.formUpdatedData['SourceOfWealth'] && 0 !== this.utillCmpObject.formUpdatedData['SourceOfWealth'].length) {
            this.sourceOfWealthObj = this.utillCmpObject.formUpdatedData['SourceOfWealth'][0];
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
        this.sourceOfWealthObj[event.target.name] = event.target.value;
        this.sourceOfWealthObj['Relationship__c'] = this.utillCmpObject.accountId;
        this.sourceOfWealthObj['RecordTypeId'] = this.recordTypeId;
    }


    /* ======================================================== 
    * @method name : handleClick() 
    * @author : EY - Gupta 
    * @purpose: form element onClick event calls this method to update data to variable.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : event - Holds event data of firing form element.
    ============================================================ */
    handleClick(event) {
        this.sourceOfWealthObj[event.target.name] = event.target.checked;
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleNext() {
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-textarea']);
        if (pageValid) {
            this.utillCmpObject.formUpdatedData['SourceOfWealth'] = [];
            this.utillCmpObject.formUpdatedData['SourceOfWealth'].push(this.sourceOfWealthObj);
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: OTHER_ASSET_OBJECT.objectApiName
            });
            this.dispatchEvent(nextEvent);
        }
    }
}