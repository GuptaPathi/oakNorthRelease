import { LightningElement, api, wire, track } from 'lwc';
import getKeyIndividuals from '@salesforce/apex/CDDFormController.getKeyIndividuals';
import { refreshApex } from '@salesforce/apex';

// Importing Labels
import UI_Text_Label_ManageKI from '@salesforce/label/c.UI_Text_Label_ManageKI';
import UI_Text_Label_CreateKI from '@salesforce/label/c.UI_Text_Label_CreateKI';

const columns = [
    { label: 'First Name' },
    { label: 'Last Name' },
    { label: 'Email' },
    { label: 'Phone' },
    { label: 'Role' },
    { label: 'Status' },
    { label: 'Action' },
];
const SEND_BUTTON_LABEL = 'Send';
const RESEND_BUTTON_LABEL = 'Resend';

export default class ManageKeyIndividuals extends LightningElement {

    // Public property Declaration
    @api ppocContactId;
    @api ppocLoanId;

    // Private property Declaration
    @track kiRecords;
    @track createNewKIFlag;
    @track selectedRecord;
    @track editedRecord;
    @track roleData;
    @track error;
    spinnerFlag = true;
    refreshTable;
    columns = columns;
    buttonOperation='';

    // Exporting labels
    label = {
        UI_Text_Label_ManageKI,
        UI_Text_Label_CreateKI
        
    };


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getKeyIndividuals, { strLoanId: '$ppocLoanId', strContactId: '$ppocContactId' })
    wiredKI(result) {
        this.refreshTable = result;  
        if (result.data) {
            let sendFlag;
            this.roleData = JSON.parse(result.data.Role);
            if(result.data.KeyIndividuals){
                this.kiRecords = JSON.parse(result.data.KeyIndividuals);
                }
            if (this.roleData && this.kiRecords) {
                this.kiRecords.forEach(element => {
                    element['Role'] = this.roleData[element.AccountId].Role__c;
                    sendFlag = 'Registered'=== element.Registration_Status__c ? false : null === element.Registration_Status__c ? true : false;
                    if (sendFlag) {
                        element['buttonlabel'] = SEND_BUTTON_LABEL;
                    } else {
                        element['buttonlabel'] = 'Registered' !== element.Registration_Status__c ? RESEND_BUTTON_LABEL : null;
                    }

                    element['buttonflag'] = null === element['buttonlabel'] ? false : true;
                });
            }
            this.error = undefined;
            this.spinnerFlag = false;
        } else if (result.error) {
            this.spinnerFlag = false;
            this.error = result.error;
            this.kiRecords= undefined;
        }

    }


    /* ======================================================== 
    * @method name : handleResendOrNewKI() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleResendOrNewKI(event) {
        this.selectedRecord = null;
        this.createNewKIFlag = true;
        this.buttonOperation='new';
    }


    /* ======================================================== 
    * @method name : handleResend() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleResend(event) {
        this.selectedRecord = this.kiRecords[event.target.name];
        this.createNewKIFlag=true;
        this.buttonOperation='resend';
    }


    /* ======================================================== 
    * @method name : closeModel() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    closeModel(event) {
        this.selectedRecord = {};
        this.createNewKIFlag=false;
        return refreshApex(this.refreshTable);
    }


    /* ======================================================== 
    * @method name : handleEdit() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleEdit(event){
        this.editedRecord = this.kiRecords[event.target.name];
        this.createNewKIFlag=true;
        this.buttonOperation='edit';
        
    }
}