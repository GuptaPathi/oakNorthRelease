/*======================================================== 
    *template name : createResendKI.JS 
    *author : EY - Gupta 
    *purpose: This JS is used to insert and update Key Individuals
    *created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, track, wire } from 'lwc';
import createKeyIndividual from '@salesforce/apex/CDDFormController.createKeyIndividual';
import sendRegisterationMail from '@salesforce/apex/CDDFormController.sendRegisterationMail';
import getErrorMessages from '@salesforce/apex/CDDFormController.getErrorMessages';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Contact.Id';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import getFormData from '@salesforce/apex/CDDFormController.getFormData';
import updateForm from '@salesforce/apex/CDDFormController.updateKeyIndividual';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Button_Label_Resend from '@salesforce/label/c.UI_Button_Label_Resend';
import UI_Button_Label_Edit from '@salesforce/label/c.UI_Button_Label_Edit';
import UI_Button_Label_New from '@salesforce/label/c.UI_Button_Label_New';
import UI_Button_Label_Resend_Invitation from '@salesforce/label/c.UI_Button_Label_Resend_Invitation';
import UI_Text_Label_KIUpdate from '@salesforce/label/c.UI_Text_Label_KIUpdate';
import UI_Text_Label_NewKI from '@salesforce/label/c.UI_Text_Label_NewKI';
import UI_Text_Label_KICreateSuccess from '@salesforce/label/c.UI_Text_Label_KICreateSuccess';
import UI_Text_Label_KIUpdSuccess from '@salesforce/label/c.UI_Text_Label_KIUpdSuccess';
import UI_Text_Label_KIUpdateErr from '@salesforce/label/c.UI_Text_Label_KIUpdateErr';
import UI_Text_Label_KISendErr from '@salesforce/label/c.UI_Text_Label_KISendErr';
import UI_Button_Label_Cancel from '@salesforce/label/c.UI_Button_Label_Cancel';
import UI_Button_Label_Send from '@salesforce/label/c.UI_Button_Label_Send';
import UI_Button_Label_Save from '@salesforce/label/c.UI_Button_Label_Save';
import UI_Button_Label_Update from '@salesforce/label/c.UI_Button_Label_Update';
import UI_Input_Label_FirstName from '@salesforce/label/c.UI_Input_Label_FirstName';
import UI_Input_Label_LastName from '@salesforce/label/c.UI_Input_Label_LastName';
import UI_Input_Label_Email from '@salesforce/label/c.UI_Input_Label_Email';
import UI_Input_Label_Phone from '@salesforce/label/c.UI_Input_Label_Phone';
import UI_Input_Label_Role from '@salesforce/label/c.UI_Input_Label_Role';
import UI_Text_Label_KI from '@salesforce/label/c.UI_Text_Label_KI';

export default class CreateResendKI extends LightningElement {

    // Exporting labels
    label = {
        UI_Button_Label_Resend,
        UI_Button_Label_Edit,
        UI_Button_Label_New,
        UI_Button_Label_Resend_Invitation,
        UI_Text_Label_KIUpdate,
        UI_Text_Label_NewKI,
        UI_Text_Label_KICreateSuccess,
        UI_Text_Label_KIUpdSuccess,
        UI_Text_Label_KIUpdateErr,
        UI_Text_Label_KISendErr,
        UI_Button_Label_Cancel,
        UI_Button_Label_Send,
        UI_Button_Label_Save,
        UI_Button_Label_Update,
        UI_Input_Label_FirstName,
        UI_Input_Label_LastName,
        UI_Input_Label_Email,
        UI_Input_Label_Phone,
        UI_Input_Label_Role,
        UI_Text_Label_KI
    };

    //declaration of public variables
    @api utillHelperObject = new ManageInformationUtil();
    @api objContactRecord = {};
    @api newKIdata = {};
    @api strPpocLoanId;
    @api strPpocContactId;
    @api buttonType = '';

    //declaration of private variables
    @track selectedRole;
    @track updatedEmail;
    @track isDisable = false;
    @track bolShowSpinner = false;
    @track updateData;
    @track bolIsUpdate = false;
    @track bolNewKIflag = false;
    @track bolResendFlag;
    @track strRequiredError;
    @track arrErrorData = {};
    @track modalHeading = this.label.UI_Text_Label_KI;


    //creating picklist values of role
    rolePickList = [
        { label: 'Director', value: 'Director' },
        { label: 'Controllers', value: 'Controllers' },
        { label: 'Shareholder', value: 'Shareholder' },
        { label: 'Legal Owner', value: 'Legal Owner' },
        { label: 'UBO', value: 'UBO' },
        { label: 'Guarantor', value: 'Guarantor' }
    ];


    /* ======================================================== 
     * @method name : connectedCallback() 
     * @author : EY - Gupta 
     * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
     * @created date (dd/mm/yyyy) : 05/08/2020 
     ============================================================*/
    connectedCallback() {
        let ContactId;
        let strAccountId;

        if (this.label.UI_Button_Label_Resend === this.buttonType) {

            this.bolResendFlag = true;
            this.bolNewKIflag = false;
            this.modalHeading = this.label.UI_Button_Label_Resend_Invitation;
        } else {
            this.bolResendFlag = false;
        }

        if (this.label.UI_Button_Label_Edit === this.buttonType) {
            this.updateData = JSON.parse(JSON.stringify(this.newKIdata));
            this.bolIsUpdate = true;
            this.bolNewKIflag = true;
            this.modalHeading = this.label.UI_Text_Label_KIUpdate;

        } else if (this.label.UI_Button_Label_New === this.buttonType) {

            this.updateData = { FirstName: '', LastName: '', Email: '', Phone: '', Role: '' };
            this.newKIdata = { FirstName: '', LastName: '', Email: '', Phone: '', Role: '' };
            this.bolIsUpdate = false;
            this.bolNewKIflag = true;
            this.modalHeading = this.label.UI_Text_Label_NewKI;
        }

        getErrorMessages()
            .then(result => {
                result.forEach(element => {
                    this.arrErrorData[element.DeveloperName] = element.Error_Message__c;
                });
            })
            .catch(error => {
                this.error = error;
            });
    }


    /* ======================================================== 
     * @method name : handleFieldChange() 
     * @author : EY - Gupta 
     * @purpose: 
     * @created date (dd/mm/yyyy) : 05/08/2020 
     ============================================================*/
    handleFieldChange(event) {

        if (this.label.UI_Button_Label_Edit === this.buttonType) {

            this.updateData[event.target.name] = event.target.value;
        }

        this.newKIdata[event.target.name] = event.target.value;
    }


    /* ======================================================== 
    * @method name : closeModal() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    closeModal() {
        this.updateData = { FirstName: '', LastName: '', Email: '', Phone: '', Role: '' };

        this.dispatchEvent(new CustomEvent('closemodelbox'));
        this.bolNewKIflag = false;
    }


    /* ======================================================== 
    * @method name : sendInvite() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    sendInvite() {

        this.bolShowSpinner = true;

        if (this.template.querySelector('.sendEmail').checkValidity() && this.template.querySelector('.sendPhone').checkValidity()) {
            let updateEmail = this.template.querySelector('.sendEmail').value;
            let updatePhone = this.template.querySelector('.sendPhone').value;
            let datastring = JSON.stringify(this.objContactRecord);

            sendRegisterationMail({ strContact: datastring, strEmail: updateEmail, strPhone: updatePhone })
                .then((result) => {
                    this.bolShowSpinner = false;
                    this.closeModal();
                    this.toastMessage('Success', this.label.UI_Text_Label_KIInvitation, 'success');
                })
                .catch((error) => {
                    this.bolShowSpinner = false;
                    this.closeModal();
                    this.toastMessage('Error', this.label.UI_Text_Label_KISendErr, 'error');
                })
        } else {
            this.bolShowSpinner = false;
            this.template.querySelector('.sendEmail').reportValidity();
        }
    }



    /* ======================================================== 
    * @method name : submitDetails() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    submitDetails() {

        let pageValid = this.utillHelperObject.validations(this.template, ['lightning-input', 'lightning-combobox']);

        this.selectedRole = this.newKIdata.Role;

        if (pageValid) {
            this.isDisable = true;
            this.bolShowSpinner = true;
            this.newKIdata['sObjectType'] = 'Contact';

            createKeyIndividual({ strContact: JSON.stringify(this.newKIdata), strLoanId: this.strPpocLoanId, strRole: this.selectedRole, strPPOCcontactD: this.strPpocContactId })
                .then((res) => {
                    this.bolShowSpinner = false;
                    this.closeModal();

                    this.toastMessage('Success', this.label.UI_Text_Label_KICreateSuccess, 'success');
                })

                .catch((error) => {
                    this.bolShowSpinner = false;
                    this.error = error;
                    this.kiRecords = null;

                    this.toastMessage('Error', this.label.UI_Text_Label_KIUpdateErr, 'error');
                });
        }
    }


    /* ======================================================== 
    * @method name : updateKI() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    updateKI() {
        let pageValid = this.utillHelperObject.validations(this.template, ['lightning-input', 'lightning-combobox']);
        if (pageValid) {
            var dataToupdate = JSON.parse(JSON.stringify(this.updateData));
            var strRoleVar = dataToupdate.Role;
            this.bolShowSpinner = true;

            delete dataToupdate.Role;
            delete dataToupdate.buttonlabel;
            delete dataToupdate.buttonflag;

            updateForm({ strContact: JSON.stringify(dataToupdate), strRole: strRoleVar })
                .then((res) => {
                    this.bolShowSpinner = false;
                    this.updateData = { FirstName: '', LastName: '', Email: '', Phone: '', Role: '' };
                    this.toastMessage('Success', this.label.UI_Text_Label_KIUpdSuccess, 'success');
                    this.closeModal();
                })
                .catch((error) => {
                    this.bolShowSpinner = false;
                    this.error = error;
                    this.kiRecords = null;
                    this.toastMessage('Error', this.label.UI_Text_Label_KIUpdateErr, 'error');

                });
        }
    }


    /* ======================================================== 
    * @method name : toastMessage() 
    * @author : EY - Gupta 
    * @purpose: toast message utility
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
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