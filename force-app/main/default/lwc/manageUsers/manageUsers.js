/*======================================================== 
    * @template name : manageUsers.js 
    * @author : EY - Ranjith 
    * @purpose: This JS file holds creation/displaying of key Individuals.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, wire, api, track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import getEntityInvolvment from '@salesforce/apex/CDDFormController.getEntityInvolvment';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import PrimaryContactFlag from '@salesforce/schema/User.Contact.LLC_BI__Primary_Contact__c';

// Importing Labels
import UI_Text_Label_CustomerDueDeligence from '@salesforce/label/c.UI_Text_Label_CustomerDueDeligence';
import UI_Text_Label_InviteOtherKI from '@salesforce/label/c.UI_Text_Label_InviteOtherKI';
import UI_Text_Label_CDF from '@salesforce/label/c.UI_Text_Label_CDF';


//Constants
const MANAGE_USERS = 'Manage Users';
const MANAGE_INFORMATION = 'Manage Information';

export default class ManageUsers extends LightningElement {

    //exporting labels
    label = {
        UI_Text_Label_CustomerDueDeligence,
        UI_Text_Label_InviteOtherKI,
        UI_Text_Label_CDF
    }

    //Public Properties - Filled By Community Page
    @api accountId;
    @api ManageUsersButtonLabel = MANAGE_USERS;
    @api ManageInfoButtonLabel = MANAGE_INFORMATION;


    //Private Properties
    @track utillHelperObject = new ManageInformationUtil();     //Service Component Instance
    @track buttonPageFlag;  // For user PPOC & KI
    @track entityData;      //Entity Involvment Data
    @track showFormA;       // For KI able to access form a
    @track showFormB;       // For KI has access formb or not 
    @track showKItable;     // For only PPOC
    @track showSpinner;     //Spinner Flag
    @track userData;        //Logged In User Details


    //get property to get contact Id
    get contactId() {
        return getFieldValue(this.userData, CONTACT_ID_FIELD);
    }


    //get property to get loan Id
    get loanId() {
        return this.entityData != null ? this.entityData.LLC_BI__Loan__c : null;
    }


    /*======================================================== 
    * @method name : wire 
    * @author : EY - Ranjith 
    * @purpose: This method is to get contact record data
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID_FIELD, PrimaryContactFlag] })
    getData({ data, error }) {
        if (data) {
            this.userData = data;
            this.utillHelperObject.ContactId = getFieldValue(this.userData, CONTACT_ID_FIELD);
        } else if (error) {
            this.toastMessage('Error', error.body.message, 'Error');

        }
    }


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    connectedCallback() {
        this.showSpinner = true;
        this.utillHelperObject.accountId = this.accountId; 

        getEntityInvolvment()
            .then((result) => {

                this.entityData = result;

                if (this.entityData != null) {
                    this.showFormB = this.utillHelperObject.formBroles.indexOf(this.entityData.Role__c) != -1 ? true : false;
                    this.showFormA = this.utillHelperObject.formAroles.indexOf(this.entityData.Role__c) != -1 || this.showFormB ? true : false;
                    this.showKItable = this.entityData.Primary_Applicant__c ? true : false;
                    this.buttonPageFlag = (this.showFormA || this.showFormB) && this.showKItable;
                    this.utillHelperObject.showFormb = this.showFormB;
                }

                this.showSpinner = false;

            })
            .catch((error) => {
                this.entityData = undefined;
                this.toastMessage('Error', error.body.message, 'Error');
                this.showSpinner = false;
            });
    }


    /* ======================================================== 
        * @method name : managePage() 
        * @author : EY - Gupta 
        * @purpose: Show/hide based on button click if logged in user is PPOC+KI
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================*/
    managePage(event) {

        if (this.ManageUsersButtonLabel === event.target.name) {
            this.showKItable = true;
            this.buttonPageFlag = false;
            this.showFormA = false;
        } else if (this.ManageInfoButtonLabel === event.target.name) {
            this.showKItable = false;
            this.buttonPageFlag = false;
            this.showFormA = true;
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