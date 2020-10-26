/*--================================================
* @component name: uploadDocuments.js
* @author: EY - Sai Kumar
* @purpose: handles uploading supporting documents 
* @created date (25/08/2020) : SPECIFY CREATED DATE in dd/mm/yyyy
================================================*/
import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import ManageInformationUtil from 'c/manageInformationUtil';
import getFiles from '@salesforce/apex/CDDFormController.getFiles';

// Importing Labels
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Button_Label_Skip from '@salesforce/label/c.UI_Button_Label_Skip';
import UI_Input_Label_Passport from '@salesforce/label/c.UI_Input_Label_Passport';
import UI_Input_Label_POA from '@salesforce/label/c.UI_Input_Label_POA';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_ErrDelRec from '@salesforce/label/c.UI_Text_Label_ErrDelRec';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_SuppDoc from '@salesforce/label/c.UI_Text_Label_SuppDoc';
import UI_Text_Label_UploadSuppDoc from '@salesforce/label/c.UI_Text_Label_UploadSuppDoc';


export default class FileUploadLWC extends LightningElement {
    
    //declaration of private variables
    isLoading = false;
    relationShipId;
    filesList;
    citizenshipCountry;
    wiredFilesResult;

    //declaration of public variables
    @api utillCmpObject;
   
    // Exporting labels
    label = {
        UI_Text_Label_SuppDoc,
        UI_Input_Label_POA,
        UI_Input_Label_Passport,
        UI_Button_Label_Next,
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_UploadSuppDoc,
        UI_Text_Label_Error,
        UI_Text_Label_Success,
        UI_Text_Label_ErrDelRec,
        UI_Button_Label_Skip
        
    };


    //property that returns accepted formats 
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg'];
    }


     /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Sai Kumar 
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 25/08/2020 
    ============================================================================*/
   @wire(getFiles, { strAccountId: '$relationShipId' })
    wiredFiles(result) {
        this.wiredFilesResult = result;
        if (result.data) {
            this.filesList = this.wiredFilesResult.data;
        } else if (result.error) {
            this.toastMessage('Error', result.error.body.message, 'error');
        }
    }
   

    /* ======================================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Sai Kumar 
    * @purpose: The renderedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables,executes below values 
                after DOM load
    * @created date (dd/mm/yyyy) : 25/08/2020 
    ============================================================================*/
    renderedCallback() {
        this.utillCmpObject.formUpdatedData['AddressHistory'].forEach(cc => {
            if (cc.Current__c) {
                this.citizenshipCountry = cc.Country__c;
            }
        });
        this.relationShipId = this.utillCmpObject.accountId;
        if ('United Kingdom' === this.citizenshipCountry) {
            this.template.querySelector('.skip').classList.add('slds-show');
            this.template.querySelector('.skip').classList.remove('slds-hide');
            this.template.querySelector('.skipm').classList.add('slds-show');
            this.template.querySelector('.skipm').classList.remove('slds-hide');
        }
        else {
            this.template.querySelector('.skip').classList.add('slds-hide');
            this.template.querySelector('.skip').classList.remove('slds-show');
            this.template.querySelector('.skipm').classList.add('slds-hide');
            this.template.querySelector('.skipm').classList.remove('slds-show');
        }
    }


    /* ==================================================================================== 
   * @method name : removeFile() 
   * @author : EY - Sai Kumar 
   * @purpose: form element onclick event calls this method to remove files data to variable.
   * @created date (dd/mm/yyyy) : 25/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */ 
    removeFile(event) {
        this.isLoading = true;
        deleteRecord(event.currentTarget.value)
            .then(() => {
                this.isLoading = false;
                this.toastMessage(this.label.UI_Text_Label_Success, this.label.UI_Text_Label_DeleteSucess, 'success');
                return refreshApex(this.wiredFilesResult);
            })
            .catch(error => {
                this.toastMessage(this.label.UI_Text_Label_ErrDelRec, error.body.message, 'Error');

            });
    }


   /* ==================================================================================== 
   * @method name : handleUploadFinished() 
   * @author : EY - Sai Kumar 
   * @purpose: handles after file upload- toast message with number of files uploaded
   * @created date (dd/mm/yyyy) : 25/08/2020 
   * @param : event - Holds event data of firing form element.
   ========================================================================================= */
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        let uploadedFileNames = '';
        for (let i = 0; i < uploadedFiles.length; i++) {
            uploadedFileNames += uploadedFiles[i].name + ', ';
        }
        this.toastMessage(this.label.UI_Text_Label_Success, uploadedFiles.length + ' Files uploaded Successfully: ' + uploadedFileNames, 'success');
        return refreshApex(this.wiredFilesResult);
    }


    /* ======================================================================== 
    * @method name : handleSubmit() 
    * @author : EY - Sai Kumar 
    * @purpose: validates and redirects on click of next button
    * @created date (dd/mm/yyyy) : 25/08/2020
    ============================================================================ */
    handleSubmit() {
        if (this.filesList.length < 2) {
            this.toastMessage(this.label.UI_Text_Label_Error, this.label.UI_Text_Label_UploadSuppDoc, 'Error');
        } else {
            this.handleSkip();
        }
    }


    /* ======================================================================== 
    * @method name : handleSkip() 
    * @author : EY - Sai Kumar 
    * @purpose: redirects to next page
    * @created date (dd/mm/yyyy) : 25/08/2020
    ============================================================================ */
    handleSkip() {
        const nextEvent = new CustomEvent('nextpage', {
            detail: 'Summary',
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(nextEvent);
        this.utillCmpObject.uploadedFiles = this.filesList;
    }


    /* ======================================================================== 
    * @method name : toastMessage() 
    * @author : EY - Sai Kumar
    * @purpose:toast message utility
    * @created date (dd/mm/yyyy) : 25/08/2020 
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