/*======================================================== 
    * @template name : splashRightContent.js 
    * @author : EY - Gupta 
    * @purpose: This js file holds all spalsh page sections content.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
import { LightningElement, api, track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

//importing lables
import UI_Section_Label_PI from '@salesforce/label/c.UI_Section_Label_PI';
import UI_Accordion_Label_AH from '@salesforce/label/c.UI_Accordion_Label_AH';
import UI_Accordion_Label_TD from '@salesforce/label/c.UI_Accordion_Label_TD';
import UI_Accordion_Label_AD from '@salesforce/label/c.UI_Accordion_Label_AD';
import UI_Accordion_Label_SD from '@salesforce/label/c.UI_Accordion_Label_SD';
import UI_Section_Label_Assets from '@salesforce/label/c.UI_Section_Label_Assets';
import UI_Section_Label_Liabilities from '@salesforce/label/c.UI_Section_Label_Liabilities';
import UI_Section_Label_Income from '@salesforce/label/c.UI_Section_Label_Income';
import UI_Section_Label_Expenditure from '@salesforce/label/c.UI_Section_Label_Expenditure';
import UI_Section_Label_SupportingDocuments from '@salesforce/label/c.UI_Section_Label_SupportingDocuments';
import UI_Text_Label_NeedFolInfo from '@salesforce/label/c.UI_Text_Label_NeedFolInfo';
import UI_Text_Label_NamePI from '@salesforce/label/c.UI_Text_Label_NamePI';
import UI_Text_Label_AHSplash from '@salesforce/label/c.UI_Text_Label_AHSplash';
import UI_Text_Label_TDSplash from '@salesforce/label/c.UI_Text_Label_TDSplash';
import UI_Text_Label_ADSplash from '@salesforce/label/c.UI_Text_Label_ADSplash';
import UI_Text_Label_POAPassCopy from '@salesforce/label/c.UI_Text_Label_POAPassCopy';
import UI_Text_Label_AssetSplash from '@salesforce/label/c.UI_Text_Label_AssetSplash';
import UI_Text_Label_LiabSplash from '@salesforce/label/c.UI_Text_Label_LiabSplash';
import UI_Text_Label_IncomeSplash from '@salesforce/label/c.UI_Text_Label_IncomeSplash';
import UI_Text_Label_ExpSplash from '@salesforce/label/c.UI_Text_Label_ExpSplash';


export default class SplashSection extends LightningElement {

    //declaration of public variables
    @api utillCmpObject;


    //declaration of private variables
    label = {
        UI_Text_Label_NeedFolInfo
    }

    form_A_content = [{
        label: UI_Section_Label_PI,
        value: 'Personal_Information',
        description: UI_Text_Label_NamePI,
        iconName: 'standard:individual',
        splashIconName: 'standard:individual',
        size: 'xx-small'
    },
    {
        label: UI_Accordion_Label_AH,
        value: 'Address_History',
        description: UI_Text_Label_AHSplash,
        iconName: 'standard:address',
        splashIconName: 'standard:address',
        size: 'xx-small'
    },
    {
        label: UI_Accordion_Label_TD,
        value: 'Tax_Details',
        description: UI_Text_Label_TDSplash,
        iconName: 'action:record',
        splashIconName: 'action:record',
        size: 'xx-small'
    },
    {
        label: UI_Accordion_Label_AD,
        value: 'Additional_Details',
        description: UI_Text_Label_ADSplash,
        iconName: 'action:new_note',
        splashIconName: 'action:new_note',
        size: 'xx-small'
    },
    {
        label: UI_Section_Label_SupportingDocuments,
        value: 'ID_Upload',
        description: UI_Text_Label_POAPassCopy,
        iconName: 'action:add_contact',
        splashIconName: 'action:add_contact',
        size: 'xx-small'
    }
    ];

    form_B_content = [{
        label: UI_Section_Label_Assets,
        value: 'Assets',
        description: UI_Text_Label_AssetSplash,
        iconName: 'utility:moneybag',
        splashIconName: 'utility:moneybag',
        size: 'xx-small'
    },
    {
        label: UI_Section_Label_Liabilities,
        value: 'Liabilities',
        description: UI_Text_Label_LiabSplash,
        iconName: 'utility:money',
        splashIconName: 'utility:money',
        size: 'xx-small'
    },
    {
        label: UI_Section_Label_Income,
        value: 'Income',
        description: UI_Text_Label_IncomeSplash,
        iconName: 'utility:database',
        splashIconName: 'utility:database',
        size: 'xx-small'
    },
    {
        label: UI_Section_Label_Expenditure,
        value: 'Expenditure',
        description: UI_Text_Label_ExpSplash,
        iconName: 'standard:client',
        splashIconName: 'standard:client',
        size: 'xx-small'
    }
    ];


    /*======================================================== 
    * @method name : handleFormA
    * @author : EY - Gupta 
    * @purpose: This method shows/hides formA related details in 
    *           splash on click of toggle button
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
    handleFormA() {

        this.template.querySelector('.form_A_button').classList.add('toggle-buttons_active');
        this.template.querySelector('.form_A_button').classList.remove('toggle-buttons_Inactive');
        this.template.querySelector('.form_B_button').classList.remove('toggle-buttons_active');
        this.template.querySelector('.form_B_button').classList.add('toggle-buttons_Inactive');
        this.template.querySelector('.form_A').classList.add('slds-show');
        this.template.querySelector('.form_A').classList.remove('slds-hide');
        this.template.querySelector('.form_B').classList.remove('slds-show');
        this.template.querySelector('.form_B').classList.add('slds-hide');
    }


    /*======================================================== 
    * @method name : handleFormB
    * @author : EY - Gupta 
    * @purpose: This method shows/hides formB related details in 
    *           splash on click of toggle button
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
    handleFormB() {

        this.template.querySelector('.form_B_button').classList.add('toggle-buttons_active');
        this.template.querySelector('.form_B_button').classList.remove('toggle-buttons_Inactive');
        this.template.querySelector('.form_A_button').classList.remove('toggle-buttons_active');
        this.template.querySelector('.form_A_button').classList.add('toggle-buttons_Inactive');
        this.template.querySelector('.form_B').classList.add('slds-show');
        this.template.querySelector('.form_B').classList.remove('slds-hide');
        this.template.querySelector('.form_A').classList.remove('slds-show');
        this.template.querySelector('.form_A').classList.add('slds-hide');
    }


    /*======================================================== 
    * @method name : renderedCallback
    * @author : EY - Gupta 
    * @purpose: This method shows/hides formB access related details in 
    *           splash page based on legal entity roles
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/
    renderedCallback() {

        if (this.utillCmpObject) {

            if (this.utillCmpObject.showFormb) {
                this.template.querySelector('.form_b_access').classList.remove('slds-hide');

            } else {
                this.template.querySelector('.form_b_access').classList.add('slds-hide');
            }
        }
    }
}