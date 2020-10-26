/* ======================================================== 
* @template name : expenditure.js 
* @author : EY - Sai Kumar 
* @purpose: This JS file is responsible for showing/saving expenditure data
* @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import ManageInformationUtil from 'c/manageInformationUtil';
import getFiles from '@salesforce/apex/CDDFormController.getFiles';
import INCOME_EXPENDITURE_OBJECT from '@salesforce/schema/Income_and_Expenditure__c';

// Importing Labels
import UI_Text_Label_KnownExpenses from '@salesforce/label/c.UI_Text_Label_KnownExpenses';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Output_Label_Mortgage from '@salesforce/label/c.UI_Output_Label_Mortgage';
import UI_Output_Label_Rent from '@salesforce/label/c.UI_Output_Label_Rent';
import UI_Input_Label_HousingTax from '@salesforce/label/c.UI_Input_Label_HousingTax';
import UI_Input_Label_TravelCosts from '@salesforce/label/c.UI_Input_Label_TravelCosts';
import UI_Input_Label_ChildernFees from '@salesforce/label/c.UI_Input_Label_ChildernFees';
import UI_Input_Label_PensionPayments from '@salesforce/label/c.UI_Input_Label_PensionPayments';
import UI_Input_Label_LifeAssurance from '@salesforce/label/c.UI_Input_Label_LifeAssurance';
import UI_Input_Label_Health from '@salesforce/label/c.UI_Input_Label_Health';
import UI_Input_Label_OtherExp from '@salesforce/label/c.UI_Input_Label_OtherExp';
import UI_Input_Label_CouncilTax from '@salesforce/label/c.UI_Input_Label_CouncilTax';
import UI_Section_Label_CreditCards from '@salesforce/label/c.UI_Section_Label_CreditCards';
import UI_Section_Label_Loans from '@salesforce/label/c.UI_Section_Label_Loans';
import UI_Text_Label_Monthly from '@salesforce/label/c.UI_Text_Label_Monthly';


export default class expenditureDetailsLWC extends LightningElement {

    // Private property Declaration
    @track expenditureDataFlag = true;
    @track ExpenditureFieldsList;
    @track strRecordTypeId;
    @track expenditureDetails = [{}];
    @track rentData = [{}];
    @track expRecordData = {
        Council_Tax__c: '',
        Housing_Cost_Maintenance__c: '',
        Travel_Cost__c: '',
        Other_Expenses__c: '',
        Health__c: '',
        Life_Assurance__c: '',
        Pension_Payments__c: '',
        Children_School_Fees__c: ''
    };

    // Public property Declaration
    @api utillCmpObject;

    label = {
        UI_Text_Label_KnownExpenses,
        UI_Button_Label_Next,
        UI_Output_Label_Mortgage,
        UI_Output_Label_Rent,
        UI_Input_Label_HousingTax,
        UI_Input_Label_TravelCosts,
        UI_Input_Label_ChildernFees,
        UI_Input_Label_PensionPayments,
        UI_Input_Label_LifeAssurance,
        UI_Input_Label_Health,
        UI_Input_Label_OtherExp,
        UI_Input_Label_CouncilTax,
        UI_Section_Label_CreditCards,
        UI_Section_Label_Loans,
        UI_Text_Label_Monthly
    };

    //wire method to get recordTypeId for Income expenditure object
    @wire(getObjectInfo, { objectApiName: INCOME_EXPENDITURE_OBJECT })
    objectInfo;
    get recordTypeId() {
        // Returns a map of record type Ids 
        if (this.objectInfo.data) {
            const rtis = this.objectInfo.data.recordTypeInfos;
            return Object.keys(rtis).find(rti => rtis[rti].name === 'Expenditure');
        }
    }


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Sai Kumar 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    connectedCallback() {
        var arrMortgages = [];
        var arrCcards = [];
        var arrRents = [];
        var arrData = [];
        var loans = [];
        var expRecord = this.utillCmpObject.formUpdatedData['Expenditure'];

        if (0 < expRecord.length) {
            this.expRecordData = expRecord[0];
        }
        if (undefined !== this.utillCmpObject.formUpdatedData['Property']) {
            this.utillCmpObject.formUpdatedData['Property'].forEach(eachRecord => {

                if ('No' === eachRecord.Ownership_Confirmation__c && null !== eachRecord.Monthly_Rent__c && undefined !== eachRecord.Monthly_Rent__c) {
                    arrRents.push(eachRecord.Monthly_Rent__c);
                }

                if ('Yes' === eachRecord.Outstanding_Mortgage_Check__c && null !== eachRecord.Monthly_Payment__c && undefined !== eachRecord.Monthly_Payment__c) {
                    arrMortgages.push(eachRecord.Monthly_Payment__c);

                }

            });

        }

        if (undefined !== this.utillCmpObject.formUpdatedData['Loans']) {
            this.utillCmpObject.formUpdatedData['Loans'].forEach(eachRecord => {
                loans.push(eachRecord.Monthly_Repayments__c);
            });
        }

        if (undefined !== this.utillCmpObject.formUpdatedData['CreditCards']) {
            this.utillCmpObject.formUpdatedData['CreditCards'].forEach(eachRecord => {
                if (undefined !== eachRecord.Monthly_Repayments__c) {
                    arrCcards.push(eachRecord.Monthly_Repayments__c);
                }
            });
        }

        if (0 < this.returnSum(arrMortgages)) {
            arrData.push({ key: this.label.UI_Output_Label_Mortgage, value: this.returnSum(arrMortgages), name: this.label.UI_Output_Label_Mortgage });
        } else {
            arrData.push({ key: this.label.UI_Output_Label_Mortgage, value: 0, name: this.label.UI_Output_Label_Mortgage });
        }

        if (0 < this.returnSum(arrRents)) {
            arrData.push({ key: this.label.UI_Output_Label_Rent, value: this.returnSum(arrRents), name: this.label.UI_Output_Label_Rent });
        } else {
            arrData.push({ key: this.label.UI_Output_Label_Rent, value: 0, name: this.label.UI_Output_Label_Rent });
        }


        if (0 < this.returnSum(loans)) {
            arrData.push({ key: this.label.UI_Section_Label_Loans, value: this.returnSum(loans), name: this.label.UI_Section_Label_Loans });
        } else {
            arrData.push({ key: this.label.UI_Section_Label_Loans, value: 0, name: this.label.UI_Section_Label_Loans });
        }
        if (0 < this.returnSum(arrCcards)) {
            arrData.push({ key: this.label.UI_Section_Label_CreditCards, value: this.returnSum(arrCcards), name: this.label.UI_Section_Label_CreditCards });
        } else {
            arrData.push({ key: this.label.UI_Section_Label_CreditCards, value: 0, name: this.label.UI_Section_Label_CreditCards });
        }

        arrData.push({ key: this.label.UI_Input_Label_HousingTax, value: this.expRecordData.Housing_Cost_Maintenance__c, name: 'Housing_Cost_Maintenance__c' },
            { key: this.label.UI_Input_Label_CouncilTax, value: this.expRecordData.Council_Tax__c, name: 'Council_Tax__c' },
            { key: this.label.UI_Input_Label_TravelCosts, value: this.expRecordData.Travel_Cost__c, name: 'Travel_Cost__c' },
            { key: this.label.UI_Input_Label_ChildernFees, value: this.expRecordData.Children_School_Fees__c, name: 'Children_School_Fees__c' },
            { key: this.label.UI_Input_Label_PensionPayments, value: this.expRecordData.Pension_Payments__c, name: 'Pension_Payments__c' },
            { key: this.label.UI_Input_Label_LifeAssurance, value: this.expRecordData.Life_Assurance__c, name: 'Life_Assurance__c' },
            { key: this.label.UI_Input_Label_Health, value: this.expRecordData.Health__c, name: 'Health__c' },
            { key: this.label.UI_Input_Label_OtherExp, value: this.expRecordData.Other_Expenses__c, name: 'Other_Expenses__c' });

        this.expenditureDetails = arrData;

    }


    /* ======================================================== 
   * @method name : handleEdit() 
   * @author : EY - Sai Kumar 
   * @purpose: for edit the records
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    handleEdit(event) {
        if (this.label.UI_Section_Label_Loans === event.target.name) {
            this.focusOnEdit('Loans');
        } else if (this.label.UI_Section_Label_CreditCards === event.target.name) {
            this.focusOnEdit('CreditCards');
        } else if (this.label.UI_Output_Label_Rent === event.target.name || this.label.UI_Output_Label_Mortgage === event.target.name) {
            this.focusOnEdit('Property');
        } else {
            this.template.querySelector('.' + event.target.name).readOnly = false;
            this.template.querySelector('.' + event.target.name).disabled = false;
        }
    }


    /* ======================================================== 
   * @method name : handbleBlur() 
   * @author : EY - Sai Kumar 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    handbleBlur(event) {
        this.template.querySelector('.' + event.target.name).readOnly = true;
    }


    /* ======================================================== 
   * @method name : handleChange() 
   * @author : EY - Sai Kumar 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    handleChange(event) {
        this.expRecordData[event.target.name] = event.target.value;
        this.expRecordData['Relationship__c'] = this.utillCmpObject.accountId;
        this.expRecordData['RecordTypeId'] = this.recordTypeId;
    }


    /* ======================================================== 
   * @method name : returnSum() 
   * @author : EY - Sai Kumar 
   * @purpose: 
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    returnSum(listOfInt) {
        var intInit = 0;
        listOfInt.forEach(int => {
            intInit += parseInt(int);
        });
        return intInit;
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Sai Kumar 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleNext() {
        this.utillCmpObject.formUpdatedData['Expenditure'] = this.expRecordData;
        const nextEvent = new CustomEvent('nextpage', {
            bubbles: true,
            composed: true,
            detail: INCOME_EXPENDITURE_OBJECT.objectApiName
        });
        this.dispatchEvent(nextEvent);
    }


    /* ======================================================== 
   * @method name : focusOnEdit() 
   * @author : EY - Sai Kumar 
   * @purpose: 
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    focusOnEdit(sectionName) {
        const editEvent = new CustomEvent('summarypageedit', {
            bubbles: true,
            composed: true,
            detail: sectionName
        });

        this.dispatchEvent(editEvent);
    }

}