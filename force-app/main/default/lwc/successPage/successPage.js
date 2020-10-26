/* ======================================================== 
    * @component name : successPage.js 
    * @author : EY - Sai Kumar 
    * @purpose: This js file has labels and images related to success page
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement,track,api } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import successImage from  '@salesforce/resourceUrl/successgif';

// Importing labels
import UI_Text_Label_ReviewDetails from '@salesforce/label/c.UI_Text_Label_ReviewDetails';
import UI_Text_Label_AllDone from '@salesforce/label/c.UI_Text_Label_AllDone';
    
export default class SuccessPage extends LightningElement {

    // Exporting labels
    label={
    UI_Text_Label_ReviewDetails,
    UI_Text_Label_AllDone
    }

    @track successGif=successImage;
    @api utillCmpObject;

}