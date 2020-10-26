/* ======================================================== 
    * @template name : liabilitiesSummary.js 
    * @author : EY - Ranjith 
    * @purpose: This js file holds all liabilities summary data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement,api } from 'lwc';

// importing Labels
import UI_Text_Label_LiabilityKnows from '@salesforce/label/c.UI_Text_Label_LiabilityKnows';
import UI_Text_Label_NoOutstLiab from '@salesforce/label/c.UI_Text_Label_NoOutstLiab';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';

export default class LiabilitiesSummary extends LightningElement {

    //declartion of public variables
    @api utillCmpObject;

    
    //declaration of private variables
    label={UI_Button_Label_Next};


    //setting Liability heading based on liabilities availability
    get strLiabilitiesHeading(){
        return this.bolLiabilityTable?UI_Text_Label_LiabilityKnows:UI_Text_Label_NoOutstLiab;
    }


    //show/hide liability table based on mortagage check box
    get bolLiabilityTable(){
        let showTable = false;
        if(undefined != this.utillCmpObject.formUpdatedData && undefined != this.utillCmpObject.formUpdatedData['Property']){
        this.utillCmpObject.formUpdatedData['Property'].forEach(eachLiability=>{
            if('Yes' === eachLiability.Outstanding_Mortgage_Check__c){
                showTable = true;
            }
        });
        }
        return showTable;
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */  
    handleNext(){
        const nextEvent = new CustomEvent('nextpage', {
            bubbles: true,
            composed: true,
            detail: null
        });
        this.dispatchEvent(nextEvent);
    }
}