/* ================================================================================== 
    * @template name : additionalInformation.js 
    * @author : EY - Ranjith 
    * @purpose: This JS file holds all Customer Additional Information records data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
======================================================================================*/
    import { LightningElement,api,track,wire} from 'lwc';
    import ManageInformationUtil from 'c/manageInformationUtil';

    // Importing Labels
    import UI_Text_Label_AdditiQues from '@salesforce/label/c.UI_Text_Label_AdditiQues';
    //import UI_Text_Label_AdditiConfirm from '@salesforce/label/c.UI_Text_Label_AdditiConfirm';
    import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';

    //Importing api's and objects
    import { getObjectInfo } from 'lightning/uiObjectInfoApi';
    import { ShowToastEvent } from 'lightning/platformShowToastEvent';
    import ACCOUNT_OBJECT from '@salesforce/schema/Account';


    export default class AdditionalInformation extends LightningElement {

    // Public property Declaration
    @api utillCmpObject; 

    // Private property Declaration
    @track additionalRecordData = {};
    
    //exporting labels defined in import
    label = {
        UI_Text_Label_AdditiQues,
        UI_Button_Label_Next
    };

    //property to get options for radio button group
    get options() {
        return [
            { label: 'Yes', value:'Yes' },
            { label: 'No', value: 'No' },
        ];
    }


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta 
    * @purpose: wire method to get Invidual record type id from account object
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    getRecordTypeId({data,error}) {
        if(data){
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Individual');

        }else if (error) {
            this.toastMessage(error.body.message, 'Error');
        }
    }


    /* ======================================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    connectedCallback() {
        if(undefined !== this.utillCmpObject.formUpdatedData['AdditionalDetails']){
            this.additionalRecordData = this.utillCmpObject.formUpdatedData['AdditionalDetails'][0];
            this.additionalRecordData['public_office_flag'] = 'Yes' === this.additionalRecordData.public_office_check__c ? true : false;
            
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
        this.additionalRecordData['Id'] = this.utillCmpObject.accountId;
        if('LIGHTNING-RADIO-GROUP' !== event.target.nodeName ){
            this.additionalRecordData[event.target.name] = event.target.value;
            var valid;
        var reg = /^([a-zA-Z0-9 ]+)$/;
        valid = reg.test(event.target.value);

        if(!valid){
            this.template.querySelector('.additionalText').setCustomValidity(this.utillCmpObject.objErrorMessages.Text_number_pattern);
        
        } else {
            this.template.querySelector('.additionalText').setCustomValidity('');
        }  
        
        } else {
            this.additionalRecordData[event.target.name] = event.target.value;
            this.additionalRecordData['public_office_flag'] = event.target.value==='Yes'?true:false;

            if('No' === event.target.value){
                this.additionalRecordData['Additional_information__c'] = '';
                
            } 
        }
    }


    /* ==================================================================================== 
    * @method name : handleClick() 
    * @author : EY - Gupta 
    * @purpose: form element onclick event calls this method to update data to variable.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : event - Holds event data of firing form element.
    ========================================================================================= */ 
    handleClick(event){
        this.additionalRecordData[event.target.name] = event.target.checked;
    }


    /* ======================================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleNext(){
        let pagevalid= this.utillCmpObject.validations(this.template,['lightning-input','lightning-radio-group','lightning-textarea']); 
        if(pagevalid){
            delete this.additionalRecordData.public_office_flag;
            this.utillCmpObject.formUpdatedData['AdditionalDetails'] = [];
            this.utillCmpObject.formUpdatedData['AdditionalDetails'].push(this.additionalRecordData);
            const nextEvent = new CustomEvent('nextpage', {
            bubbles: true,
            composed: true,
            detail: ACCOUNT_OBJECT.objectApiName
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