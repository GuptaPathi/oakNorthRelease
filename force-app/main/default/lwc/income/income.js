/* ======================================================== 
    * @template name : income.js 
    * @author : EY - Sai Kumar 
    * @purpose: This html file holds all income records data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, wire, track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_AlreadyKnownIncome from '@salesforce/label/c.UI_Text_Label_AlreadyKnownIncome';
import UI_Text_Label_EmploymentQue from '@salesforce/label/c.UI_Text_Label_EmploymentQue';
import UI_Input_Label_EmpFullName from '@salesforce/label/c.UI_Input_Label_EmpFullName';
import UI_Input_Label_JuridCountry from '@salesforce/label/c.UI_Input_Label_JuridCountry';
import UI_Input_Label_AnnualSalaryReceivings from '@salesforce/label/c.UI_Input_Label_AnnualSalaryReceivings';
import UI_Input_Label_BonusReceivingsAnnually from '@salesforce/label/c.UI_Input_Label_BonusReceivingsAnnually';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_CompanyQue from '@salesforce/label/c.UI_Text_Label_CompanyQue';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Input_Label_Yearly from '@salesforce/label/c.UI_Input_Label_Yearly';
import UI_Input_Label_Salary from '@salesforce/label/c.UI_Input_Label_Salary';
import UI_Input_Label_Bonus from '@salesforce/label/c.UI_Input_Label_Bonus';


import getFiles from '@salesforce/apex/CDDFormController.getFiles';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import INCOME_EXPENDITURE_OBJECT from '@salesforce/schema/Income_and_Expenditure__c';
import SELECT_COUNTRY from '@salesforce/schema/Income_and_Expenditure__c.Country_Jurisdiction_Of_Business_Trading__c';

export default class incomeDetailsLWC extends LightningElement {

    // Public property Declaration
    @api utillCmpObject;
    
    // Private property Declaration
    @track doYouHaveFlag;
    @track objectInfo;
    @track incomeDataFlag = false;
    @track incomeDetails = [{}];
    @track rentData;
    @track arrIds = [];
    @track strRecordTypeId;
    @track arrSalaryData = [];
    @track IncomeRecordObj = {
        Country_Jurisdiction_Of_Business_Trading__c: '',
        Employer_Full_Name__c: '',
        Salary_Received_Annually__c: '',
        Bonus_Received_Annually__c: '',
        Relationship__c: ''
    }

    //exporting labels
    label = {
        UI_Text_Label_AlreadyKnownIncome,
        UI_Text_Label_EmploymentQue,
        UI_Input_Label_EmpFullName,
        UI_Input_Label_JuridCountry,
        UI_Input_Label_AnnualSalaryReceivings,
        UI_Input_Label_BonusReceivingsAnnually,
        UI_Button_Label_Next,
        UI_Text_Label_AddAnother,
        UI_Text_Label_CompanyQue,
        UI_Text_Label_DeleteSucess,
        UI_Input_Label_Yearly,
        UI_Input_Label_Salary,
        UI_Input_Label_Bonus
    };

    @track doYouHaveCmpheaderQuestion = this.label.UI_Text_Label_CompanyQue;
    

    get showDeleteIcon(){
        return this.arrSalaryData.length > 1?true:false;
    }

    get showSalaryFields(){
        return this.arrSalaryData.length > 0?true:false;
    }

    @wire(getObjectInfo, { objectApiName: INCOME_EXPENDITURE_OBJECT })
    objectInfo;
    get recordTypeId() {
        // Returns a map of record type Ids 
        if (this.objectInfo.data) {
            const rtis = this.objectInfo.data.recordTypeInfos;
            return Object.keys(rtis).find(rti => rtis[rti].name === 'Salary');
        }
    }
   
   
    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Sai Kumar 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    connectedCallback() {
        var data = [];
        var salaries = [];

        this.arrCountry =[...this.utillCmpObject.countryPickList];

        if (undefined !== this.utillCmpObject.formUpdatedData['Property']) {

            this.utillCmpObject.formUpdatedData['Property'].forEach(eachRecord => {

                if ('Yes' === eachRecord.Rental_Income_Check__c) {
                    var propertyData = {};
                    var propertyName=eachRecord.Street__c!=undefined?eachRecord.Street__c:eachRecord.Flat__c!=undefined?eachRecord.Flat__c:eachRecord.Property_Type__c
                    propertyData['key'] = propertyName + ' - Rental Income';
                    propertyData['value'] = '£ ' + eachRecord.Annual_Earnings__c;
                    propertyData['name'] = 'Property';
                    data.push(propertyData);
                }
            });
        }

        if (undefined !== this.utillCmpObject.formUpdatedData['Trust']) {

            this.utillCmpObject.formUpdatedData['Trust'].forEach(eachRecord => {

                if ('Yes' === eachRecord.Dividends_Received__c) {
                    var trustData = {};
                    trustData['key'] = eachRecord.Full_Legal_Name_Of_the_Trust__c + ' - Trust';
                    trustData['value'] = '£ ' + eachRecord.Amount_Received_Annually__c;
                    trustData['name'] = 'Trust';
                    data.push(trustData);
                }
            });
        }

        if (undefined !== this.utillCmpObject.formUpdatedData['Business']) {

            this.utillCmpObject.formUpdatedData['Business'].forEach(eachRecord => {
                ['InvestmentPortfolios']
                    var businessData = {};
                    businessData['key'] = eachRecord.Full_Legal_Trading_Name_Of_The_Business__c + ' - Salary';
                    businessData['value'] = '£ ' + eachRecord.Annual_Salary__c;
                    businessData['name'] = 'Salary';
                    data.push(businessData);
                    if(eachRecord.Amount_Received_Annually__c){
                    businessData = {};
                    businessData['key'] = eachRecord.Full_Legal_Trading_Name_Of_The_Business__c + ' - Dividends';
                    businessData['value'] = '£ ' + eachRecord.Amount_Received_Annually__c;
                    businessData['name'] = 'Dividends';
                    data.push(businessData);
                    }
                
            });
        }

        if (undefined !== this.utillCmpObject.formUpdatedData['InvestmentPortfolios']) {

            this.utillCmpObject.formUpdatedData['InvestmentPortfolios'].forEach(eachRecord => {
                    
                if(eachRecord.Annual_Dividends__c){
                    var investmentData = {};
                    investmentData['key'] = eachRecord.Advisor_Full_Name_Portfolio_Manager__c + ' - Dividends';
                    investmentData['value'] = '£ ' + eachRecord.Annual_Dividends__c;
                    investmentData['name'] = 'Dividends';
                    data.push(investmentData);
                    }
            });
        }

        if (undefined !== this.utillCmpObject.formUpdatedData['Shares']) {

            this.utillCmpObject.formUpdatedData['Shares'].forEach(eachRecord => {
                    
                if(eachRecord.Amount_Received_Annually__c){
                    var sharesData = {};
                    sharesData['key'] = eachRecord.Full_Legal_Name_Of_Entity__c + ' - Dividends';
                    sharesData['value'] = '£ ' + eachRecord.Amount_Received_Annually__c;
                    sharesData['name'] = 'Dividends';
                    data.push(sharesData);
                }
            });
        }
        
        
        if (undefined !== this.utillCmpObject.formUpdatedData['Salary']) {
            this.utillCmpObject.formUpdatedData['Salary'].forEach((eachRecord, rowindex) => {
                eachRecord['index'] = rowindex;
                eachRecord['showInTable']=true;
                salaries.push(eachRecord);
             });
            if (0 < salaries.length) {
                this.doYouHaveCmpheaderQuestion = this.label.UI_Text_Label_EmploymentQue;
                this.doYouHaveFlag = 'Yes';
            }
        }
        this.arrSalaryData = salaries;
        this.incomeDetails = data;
        this.incomeDataFlag = true;
    }


    /* ======================================================== 
    * @method name : handleDoYouHaveClick() 
    * @author : EY - Sai Kumar 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleDoYouHaveClick(event) {
        if ('Yes' === event.detail) {
            this.addSalary();
        }else{
            let arrIds=[]; // To hold all record Ids
            if(0 !== this.arrSalaryData.length){
                //Collecting each record Id
                this.arrSalaryData.forEach((ele,index)=>{
                    if(ele.Id){
                        arrIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(1 < arrIds.length){
                    this.utillCmpObject.formUpdatedData['Salary'] = [];

                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: arrIds
                    });

                    this.dispatchEvent(deleteEvent);
                    
                } else if (1 === arrIds.length){ // Only one Id
                    this.deleteIncomeRecord(arrIds[0]);
                    this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess, 'success');
                    this.arrSalaryData=[];
                    this.handleNext();
                } else { // No ids
                    this.arrSalaryData=[];
                    this.handleNext();
                }
            }else{
                this.handleNext();
            }
        }
    }

  
    /* ======================================================== 
    * @method name : handleEdit() 
    * @author : EY - Sai Kumar 
    * @purpose: The handleEdit() for editing the records
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleEdit(event) {
        this.utillCmpObject.summaryPageRecord = this.summaryDetails[event.target.name];
        const editEvent = new CustomEvent('summarypageedit', {
            bubbles: true,
            composed: true,
            detail: event.target.name
        });
        this.dispatchEvent(editEvent);
    }


   /* ======================================================== 
   * @method name : handleChange() 
   * @author : EY - Sai Kumar 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */ 
    handleChange(event) {
        this.arrSalaryData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.arrSalaryData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.arrSalaryData[event.currentTarget.dataset.index]['RecordTypeId'] = this.recordTypeId;
        this.IncomeRecordObj[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
    }


    /* ======================================================== 
    * @method name : addSalary() 
    * @author : EY - Sai Kumar 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addSalary() {
        if(this.arrSalaryData.length > 0){
            this.arrSalaryData[this.arrSalaryData.length-1]['showInTable']=true;
        }

        this.IncomeRecordObj['index'] = this.arrSalaryData.length;
        this.IncomeRecordObj['showInTable'] = false;
        var record = JSON.stringify(this.IncomeRecordObj);
        let pagevalid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-combobox', 'lightning-radio-group']);
        if (pagevalid) {
            this.arrSalaryData.push(JSON.parse(record));
        }

    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Sai Kumar 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 strAccountId - LoanId value
    * @return: event - Holds event data of firing form element.
    ============================================================ */
    removeRecord(event){
        this.removeIncomeRecord(event.currentTarget.dataset.index)
        this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess, 'success');
    }

    removeIncomeRecord(index){
        var deletedRecord = this.arrSalaryData[index];
        if (deletedRecord.Id) {
           this.deleteIncomeRecord(deletedRecord.Id);
        }
        this.arrSalaryData.splice(index, 1); 
    }

    deleteIncomeRecord(recordId){
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
    * @author : EY - Sai Kumar 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
      handleNext() {
        let pageValid = this.arrSalaryData.length>0?this.utillCmpObject.validations(this.template, ['lightning-input']):true;
        if (pageValid) {
            this.arrSalaryData.forEach(ele => {
                delete ele.index;
                delete ele.showInTable;
            });
            this.utillCmpObject.formUpdatedData['Salary'] = this.arrSalaryData;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: INCOME_EXPENDITURE_OBJECT.objectApiName
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