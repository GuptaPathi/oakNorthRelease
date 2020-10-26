import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_Names from '@salesforce/label/c.UI_Text_Label_Names';
import UI_Input_Label_FullName from '@salesforce/label/c.UI_Input_Label_FullName';
import UI_Input_Label_AliasQues from '@salesforce/label/c.UI_Input_Label_AliasQues';
import UI_Input_Label_DOB from '@salesforce/label/c.UI_Input_Label_DOB';
import UI_Input_Label_COB from '@salesforce/label/c.UI_Input_Label_COB';
import UI_Input_Label_Alias from '@salesforce/label/c.UI_Input_Label_Alias';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';

export default class PersonalInformation extends LightningElement {

    // Public property Declaration
    @api utillCmpObject;

    // Private property Declaration
    @track personalRecordData;
    @track aliasNameList = [];
    @track aliasNameData = [];
    @track lstCountry = [{}];
    recordTypeId;
    @track fullLegalName = '';

    // Exporting labels
    label = {
        UI_Text_Label_Names,
        UI_Input_Label_FullName,
        UI_Input_Label_AliasQues,
        UI_Input_Label_DOB,
        UI_Input_Label_COB,
        UI_Input_Label_Alias,
        UI_Text_Label_AddAnother,
        UI_Button_Label_Next
    };

    options = [
        { 'label': 'Yes', 'value': 'Yes' },
        { 'label': 'No', 'value': 'No' },
    ];  

    //property that returns  alias name length
    get aliasFlag() {
        return (1 === this.aliasNameList.length)? true : false;
    }

    //property that returns  alias name input box
    get showAliasTextBox(){
        return 'Yes' === this.personalRecordData.Other_Name_Alias_Check__c
                ?true   
                :'No' === this.personalRecordData.Other_Name_Alias_Check__c
                    ?false  
                    :'';
    }


    /* ======================================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    connectedCallback() {
        /* Country Pick List Populating from Utill Component*/
        this.lstCountry=[...this.utillCmpObject.countryPickList];

        /* Getting existing Data From Utill Service Component */
        this.personalRecordData = this.utillCmpObject.formUpdatedData['PersonalDetails'];

        /* Data aligning to page fields */
        if (undefined !== this.personalRecordData) {

            /* Clubing first name and last name to make visible full leagal name to user */
            if (this.personalRecordData) {
                var fname = this.personalRecordData.FirstName?this.personalRecordData.FirstName:'';
                this.fullLegalName = fname + ' ' + this.personalRecordData.LastName;
            }
            /* Splitting Alias Names */
            if ('Yes' === this.personalRecordData.Other_Name_Alias_Check__c && null !== this.personalRecordData.Other_Name_Alias__c) {
                this.personalRecordData.Other_Name_Alias__c.split(',').forEach((aliasName, index) => {
                    this.aliasNameList.push(aliasName);
                    var objAliasData = {Name: aliasName,index:index};
                    this.aliasNameData.push(objAliasData);
                });
            } else {
                this.personalRecordData.Other_Name_Alias__c = '';
            }

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
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
            today = yyyy + '-' + mm + '-' + dd;
        if ('Name' !== event.target.name) {
            this.personalRecordData[event.target.name] = event.target.value;
        } else if (event.target.value) {
            var sName = event.target.value.trim();
            var Name = sName.split(' ');
            var lastname = Name.slice(-1).pop();
            var n = sName.lastIndexOf(lastname);
            var fname = sName.slice(0, n) + sName.slice(n).replace(lastname, '');
            this.personalRecordData['LastName'] = lastname;
            this.personalRecordData['FirstName'] = undefined != fname?fname:null;
        }

        if ('Birthdate' === event.target.name) {
            let dateOfBirthElement = this.template.querySelector('[data-id="dateOfBirth"]');
            let dateOfBirth = event.target.value;
            if (dateOfBirth > today) {
                dateOfBirthElement.setCustomValidity("Date of Birth must not be future date");
            } else {
                this.personalRecordData.Birthdate = dateOfBirth;
                dateOfBirthElement.setCustomValidity(""); // clear previous value
            } dateOfBirthElement.reportValidity();
        }
    }


   /* ==================================================================================== 
   * @method name : aliasNamesSelection() 
   * @author : EY - Gupta 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */ 
    aliasNamesSelection(event) {
        this.personalRecordData[event.target.name] = event.target.value;//=='true'?true:false;
        if ('No' === event.target.value){
            this.aliasNameList = [];
            this.aliasNameData=[];
        } else {
            this.aliasNameList.push(null);
            this.aliasNameData.push({index:0,Name:''})
        }
    }


   /* ==================================================================================== 
   * @method name : addAlias() 
   * @author : EY - Gupta 
   * @purpose: form element onclick  event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   ========================================================================================= */ 
    addAlias() {
        let pageValid= this.utillCmpObject.validations(this.template.querySelector('.aliasBock'),['lightning-input']); 
        if (pageValid) {
        this.aliasNameList.push(null);
        this.aliasNameData.push({index:this.aliasNameData.length,Name:''});
        }
    }


    /* ==================================================================================== 
   * @method name : removeAlias() 
   * @author : EY - Gupta 
   * @purpose: form element onclick event calls this method to remove alias data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */
    removeAlias(event) {
        this.aliasNameList.splice(event.currentTarget.dataset.index,1);
        this.aliasNameData.splice(event.currentTarget.dataset.index,1);
    }


   /* ==================================================================================== 
   * @method name : aliasNamesChange() 
   * @author : EY - Gupta 
   * @purpose: 
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */
    aliasNamesChange(event) {
        this.aliasNameData[event.currentTarget.dataset.index]['Name'] = event.target.value;      
    }


    /* ======================================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an 
                event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================ */
    handleNext() {
        var lstAliasName=[];
        this.aliasNameData.forEach(eachAlias=>{
            lstAliasName.push(eachAlias['Name']);
        });
        this.personalRecordData['Other_Name_Alias__c'] = lstAliasName.toString();
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-radio-group', 'lightning-combobox']);
        if (pageValid) {
            this.utillCmpObject.formUpdatedData['PersonalDetails'] = this.personalRecordData;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: 'AddressHistory'
            });
            this.dispatchEvent(nextEvent);
        }

    }
}