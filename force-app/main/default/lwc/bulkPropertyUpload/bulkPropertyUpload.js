/* ================================================================================== 
    * @template name : bulkPropertyUpload.js 
    * @author : EY - Ranjith 
    * @purpose: This JS file holds bulkPropertyUpload functionality 
    *           to upload property as attachment.
    * @created date (dd/mm/yyyy) : 20/08/2020 
======================================================================================*/
import { LightningElement, track, api } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import getFiles from '@salesforce/apex/CDDFormController.getBulkUploadFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import saveFile from '@salesforce/apex/CDDFormController.bulkPropertyUpload';

// Importing Labels
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_PropertyPortBulkUp from '@salesforce/label/c.UI_Text_Label_PropertyPortBulkUp';
import UI_Text_Label_PropertyAddrListPortfolio from '@salesforce/label/c.UI_Text_Label_PropertyAddrListPortfolio';
import UI_Button_Label_Confirm_Upload from '@salesforce/label/c.UI_Button_Label_Confirm_Upload';
import UI_Button_Label_Cancel from '@salesforce/label/c.UI_Button_Label_Cancel';
import UI_Text_Label_ErrDelRec from '@salesforce/label/c.UI_Text_Label_ErrDelRec';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_FileUplSuccess from '@salesforce/label/c.UI_Text_Label_FileUplSuccess';
import UI_Text_Label_RecUpdSuccess from '@salesforce/label/c.UI_Text_Label_RecUpdSuccess';
import UI_Text_Label_UplFileErr from '@salesforce/label/c.UI_Text_Label_UplFileErr';



const columns = [{label: 'Title', fieldName: 'FileName', type: 'url', typeAttributes: {label: {fieldName: 'Title'},target: '_blank'}}];

export default class BulkPropertyUpload extends LightningElement {

    // private property Declaration
    showLoadingSpinner = false;
    @track fileNames = '';
    @track filesUploaded = [];
    @track data;
    @track columns = columns;
    @track lstAllProperties = [];

    // public property Declaration
    @api recordTypeId;
    @api accountId;
    @api bulkRecord = {};
    @api utillCmpObject;

    //delete button will appear only if files are more than one
    get bolShowDelete() {
        return this.filesUploaded.length > 1 ? true : false;
    }

    // exporting labels
    label = {
        UI_Text_Label_PropertyPortBulkUp,
        UI_Text_Label_PropertyAddrListPortfolio,
        UI_Button_Label_Confirm_Upload,
        UI_Button_Label_Cancel,
        UI_Text_Label_ErrDelRec,
        UI_Text_Label_Success,
        UI_Text_Label_Error,
        UI_Text_Label_FileUplSuccess,
        UI_Text_Label_RecUpdSuccess,
        UI_Text_Label_UplFileErr

    };


     /* ======================================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component 
                is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    connectedCallback() {
        if (undefined != this.bulkRecord.Id && null != this.bulkRecord.Id) {
            getFiles({ strPropertyId: this.bulkRecord.Id })
                .then((receivedFiles) => {

                    var lstFiles = receivedFiles;

                    lstFiles.forEach(eachFile => {

                        this.filesUploaded.push({
                            Title: eachFile.ContentDocument.Title,
                            ContenDocumentId: eachFile.ContentDocumentId
                        });
                    });

                })
                .catch((error) => {

                    this.toastMessage(this.label.UI_Text_Label_ErrDelRec, error.body.message, 'Error');
                });
        }
    }


    /* ======================================================== 
    * @method name : handleFileChanges() 
    * @author : EY - Gupta 
    * @purpose: Method will add files to the filesUploaded variable
    * @created date (dd/mm/yyyy) : 05/08/2020 
    * @param : event - Holds event data of firing form element.
    ============================================================ */
    handleFileChanges(event) {
        let files = event.target.files;

        if (0 < files.length) {
            let filesName = '';

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                filesName = filesName + file.name + ',';
                let freader = new FileReader();

                freader.onload = f => {
                    let base64 = 'base64,';
                    let content = freader.result.indexOf(base64) + base64.length;
                    let fileContents = freader.result.substring(content);
                    this.filesUploaded.push({
                        Title: file.name,
                        VersionData: fileContents
                    });
                };
                freader.readAsDataURL(file);
            }

            this.fileNames = filesName.slice(0, -1);
        }
    }


    /* ======================================================== 
    * @method name : handleSaveFiles() 
    * @author : EY - Gupta 
    * @purpose: this methods handles saving of files
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleSaveFiles() {
        if (this.filesUploaded.length > 0) {

            this.showLoadingSpinner = true;
            let fielsToUpload = [];

            //Data Mapping
            let data = JSON.parse(JSON.stringify(this.bulkRecord));
            data['Relationship__c'] = this.accountId;
            data['RecordTypeId'] = this.recordTypeId;
            data['Property_Type__c'] = 'Bulk Assets';
            data['Outstanding_Mortgage_Check__c'] = data.Outstanding_Mortgage_Check__c;
            data['Rental_Income_Check__c'] = data.Rental_Income_Check__c;
            this.lstAllProperties.push(data);

            //Files Mapping
            this.filesUploaded.forEach(eachFile => {
                if (undefined == eachFile.ContenDocumentId) {
                    fielsToUpload.push(eachFile);
                }
            })

            //Apex call to save newly uploaded files
            saveFile({ strAsset: JSON.stringify(data), lstFilesToInsert: fielsToUpload })
                .then(data => {
                    this.showLoadingSpinner = false;
                    let message = this.fileNames != '' ? this.fileNames + this.label.UI_Text_Label_FileUplSuccess : this.label.UI_Text_Label_RecUpdSuccess;

                    this.toastMessage(this.label.UI_Text_Label_Success, message, 'success');

                    const nextEvent = new CustomEvent('nextproperty', {
                        detail: data
                    });

                    this.dispatchEvent(nextEvent);

                    this.fileNames = undefined;
                })
                .catch(error => {
                    this.toastMessage(this.label.UI_Text_Label_Error , this.label.UI_Text_Label_UplFileErr, 'error');
                });
        } else {

            this.utillCmpObject.validations(this.template, ['lightning-input']);
        }
    }


    /* ======================================================== 
    * @method name : handleCancel() 
    * @author : EY - Gupta 
    * @purpose: this method handles cancel button functionality
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancelbulkupload', { detail: null }));
    }


    /* ======================================================== 
   * @method name : removeFile() 
   * @author : EY - Gupta 
   * @purpose: this method handles deletion of files
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    removeFile(event) {
        let fileToDelete = this.filesUploaded[event.currentTarget.dataset.index];

        if (undefined != fileToDelete.ContenDocumentId) {

            deleteRecord(fileToDelete.ContenDocumentId)
                .then(() => {
                    
                    this.isLoading = false;
                    this.toastMessage(this.label.UI_Text_Label_Success, UI_Text_Label_DeleteSucess, 'success');
                    return refreshApex(this.wiredFilesResult);
                })
                .catch(error => {
                    this.toastMessage(this.label.UI_Text_Label_Error , error.body.message, 'Error');

                });
        }
        this.filesUploaded.splice(event.currentTarget.dataset.index, 1);
    }

    /* ======================================================== 
   * @method name : toastMessage() 
   * @author : EY - Gupta 
   * @purpose: utility method for toast message.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : strTitle - title of the toast message.
   * @param : strMessage - message in the toast message.
   * @param : strVariant - variant of the toast message.
   ============================================================ */
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