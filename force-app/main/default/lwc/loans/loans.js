/*======================================================== 
    * @method name : loans.js 
    * @author : EY - Ranjith 
    * @purpose: This js file holds saving/showing of loans data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, track,wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LIABILITY_OBJECT from '@salesforce/schema/Liability__c';


// Importing Labels
import UI_Text_Label_LoanQue from '@salesforce/label/c.UI_Text_Label_LoanQue';
import UI_Text_Label_PurchasesArrange from '@salesforce/label/c.UI_Text_Label_PurchasesArrange';
import UI_Text_Label_LoanDetails from '@salesforce/label/c.UI_Text_Label_LoanDetails';
import UI_Input_Label_LenderName from '@salesforce/label/c.UI_Input_Label_LenderName';
import UI_Input_Label_OwingAmount from '@salesforce/label/c.UI_Input_Label_OwingAmount';
import UI_Input_Label_MonthlyRepayments from '@salesforce/label/c.UI_Input_Label_MonthlyRepayments';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnother from '@salesforce/label/c.UI_Text_Label_AddAnother';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';


export default class Loans extends LightningElement {

    // Private property Declaration
    @track loanRecordObj = {index: 0, Lender_Name__c: '', Amount_Owing__c: '', Monthly_Repayments__c: '' };
    @track arrIds = [];
    @track arrLoansData = [];
    @track doYouHaveFlag;
    @track strRecordTypeId


    // Public property Declaration
    @api utillCmpObject;


    // Exporting labels
    label = {
        UI_Text_Label_LoanQue,
        UI_Text_Label_PurchasesArrange,
        UI_Text_Label_LoanDetails,
        UI_Input_Label_LenderName,
        UI_Input_Label_OwingAmount,
        UI_Input_Label_MonthlyRepayments,
        UI_Button_Label_Next,
        UI_Text_Label_AddAnother,
        UI_Text_Label_DeleteSucess
        
    };
    

    //property to show /hide deleteIcon
    get showDeleteIcon(){
        return this.arrLoansData.length > 1?true:false;
    }


    //property to show/ hide loan fields
    get showLoansFields(){
        return this.arrLoansData.length > 0?true:false;
    }


    /* ======================================================== 
    * @method name : wire() 
    * @author : EY - Gupta 
    * @purpose: Wire method to get recordTypeId of Loans from LiabilityObject
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    @wire(getObjectInfo, { objectApiName: LIABILITY_OBJECT })
    getRecordTypeId({data,error}) {

        if(data){
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Loans');

        }else if (error) {
            this.toastMessage(error.body.message, 'error');
       }
    } 


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    connectedCallback() {
            var loanData = [];

            if (undefined !== this.utillCmpObject.formUpdatedData['Loans'].length) {

                if (0 < this.utillCmpObject.formUpdatedData['Loans'].length) {

                    this.utillCmpObject.formUpdatedData['Loans'].forEach((ele, rowindex) => {
                        ele['index'] = rowindex;
                        loanData.push(ele);
                    })
                    this.arrLoansData = loanData;

                    if(0 < loanData.length){
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
    handleDoYouHaveClick(event) {

        if('Yes' === event.detail){

            this.addLoan();
        } else {
            let arrIds=[]; // To hold all record Ids
            if(0 !== this.arrLoansData.length){
                //Collecting each record Id
                this.arrLoansData.forEach((ele,index)=>{
                    if(ele.Id){
                        arrIds.push(ele.Id);
                    }
                });
    
                //More than one id 
                if(1 < arrIds.length){
                    this.utillCmpObject.formUpdatedData['Loans'] = [];
                    const deleteEvent = new CustomEvent('deleterecord', {
                        bubbles: true,
                        composed: true,
                        detail: arrIds
                    });
                    this.dispatchEvent(deleteEvent);

                } else if(1 === arrIds.length){ // Only one Id
                    this.deleteLoanRecord(arrIds[0]);
                    this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess , 'success');
                    this.arrLoansData=[];
                    this.handleNext();

                } else { // No ids
                    this.arrLoansData=[];
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
    handleChange(event) {
        this.arrLoansData[event.currentTarget.dataset.index][event.target.name] = event.target.value;
        this.arrLoansData[event.currentTarget.dataset.index]['Relationship__c'] = this.utillCmpObject.accountId;
        this.arrLoansData[event.currentTarget.dataset.index]['RecordTypeId'] = this.strRecordTypeId;
    }


    /* ======================================================== 
    * @method name : addLoan() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addLoan() {

        this.loanRecordObj['index'] = this.arrLoansData.length;
        var record = JSON.stringify(this.loanRecordObj);
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input']);

        if (pageValid){
            this.arrLoansData.push(JSON.parse(record));
        }
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Gupta 
    * @purpose: calls when user clicks delete button.To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 event - Holds event data of firing form element.
    ============================================================ */ 
    removeRecord(event){
        this.removeLoanRecord(event.currentTarget.dataset.index)
        this.toastMessage('Success', this.label.UI_Text_Label_DeleteSucess, 'success');
    }


    /* ======================================================== 
    * @method name : removeRecord() 
    * @author : EY - Gupta 
    * @purpose: To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 index - Holds index value
    ============================================================ */    
    removeLoanRecord(index){
        var deletedRecord = this.arrLoansData[index];

        if (deletedRecord.Id) {
           this.deleteLoanRecord(deletedRecord.Id);
        }
        this.arrLoansData.splice(index, 1);
        
    }


    /* ======================================================== 
    * @method name : deleteLoanRecord() 
    * @author : EY - Gupta 
    * @purpose: To remove record from the list.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : Param 1 recordId - Holds recordId to delete record
    ============================================================ */
    deleteLoanRecord(recordId){

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
    handleNext() {
        let pageValid = this.arrLoansData.length>0?this.utillCmpObject.validations(this.template, ['lightning-input']):true; 

        if (pageValid) {
            this.arrLoansData.forEach(ele => {
                delete ele.index;
            });

            this.utillCmpObject.formUpdatedData['Loans'] = this.arrLoansData;

            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: LIABILITY_OBJECT.objectApiName
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