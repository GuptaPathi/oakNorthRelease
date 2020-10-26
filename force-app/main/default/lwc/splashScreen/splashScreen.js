import { LightningElement, api, track } from "lwc";
import ManageInformationUtil from 'c/manageInformationUtil';
import splashScreenButtonLabel from "@salesforce/label/c.splashScreenButton";
import OakNorthLogo from "@salesforce/resourceUrl/OakNorthLogo";

// Importing Labels
import UI_Text_Label_CDD from '@salesforce/label/c.UI_Text_Label_CDD';
import UI_Text_Label_CDDDesc from '@salesforce/label/c.UI_Text_Label_CDDDesc';
import UI_Button_Label_GetStarted from '@salesforce/label/c.UI_Button_Label_GetStarted';
import UI_Text_Label_AutoSave from '@salesforce/label/c.UI_Text_Label_AutoSave';
import UI_Text_Label_CDDDesc2 from '@salesforce/label/c.UI_Text_Label_CDDDesc2';
import UI_Section_Label_PI from '@salesforce/label/c.UI_Section_Label_PI';
import UI_Section_Label_AddressHistory from '@salesforce/label/c.UI_Section_Label_AddressHistory';
import UI_Section_Label_TaxDetails from '@salesforce/label/c.UI_Section_Label_TaxDetails';
import UI_Section_Label_AdditionalDetails from '@salesforce/label/c.UI_Section_Label_AdditionalDetails';
import UI_Section_Label_SupportingDocuments from '@salesforce/label/c.UI_Section_Label_SupportingDocuments';
import UI_Section_Label_Assets from '@salesforce/label/c.UI_Section_Label_Assets';
import UI_Section_Label_Liabilities from '@salesforce/label/c.UI_Section_Label_Liabilities';
import UI_Section_Label_Income from '@salesforce/label/c.UI_Section_Label_Income';
import UI_Section_Label_Expenditure from '@salesforce/label/c.UI_Section_Label_Expenditure';

export default class SplashScreen extends LightningElement {
    buttonLabel = splashScreenButtonLabel;
    @api utillCmpObject;
    OakNorthLogo = OakNorthLogo;
    entireModal = true;

    @api has_Form_B = false;

    // Exporting labels
    label = {
        UI_Text_Label_CDD,
        UI_Text_Label_CDDDesc,
        UI_Button_Label_GetStarted,
        UI_Text_Label_AutoSave,
        UI_Text_Label_CDDDesc2,
        UI_Section_Label_PI,
        UI_Section_Label_AddressHistory,
        UI_Section_Label_TaxDetails,
        UI_Section_Label_AdditionalDetails,
        UI_Section_Label_SupportingDocuments,
        UI_Section_Label_Assets,
        UI_Section_Label_Liabilities,
        UI_Section_Label_Income,
        UI_Section_Label_Expenditure

    };

    form_A_content = [{
            label: UI_Section_Label_PI,
            value: "Personal_Information",
            description: "Name, Date of birth, Country of birth",
            iconName: "standard:individual",
            splashIconName: "standard:individual",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_AddressHistory,
            value: "Address_History",
            description: "The last 3 years of your address history",
            iconName: "standard:address",
            splashIconName: "standard:address",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_TaxDetails,
            value: "Tax_Details",
            description: "Tax identification number",
            iconName: "action:record",
            splashIconName: "action:record",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_AdditionalDetails,
            value: "Additional_Details",
            description: "Whether you or anyone from your family holds a public office in the UK",
            iconName: "action:new_note",
            splashIconName: "action:new_note",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_SupportingDocuments,
            value: "ID_Upload",
            description: "Proof of your address and a certified copy of your passport",
            iconName: "action:add_contact",
            splashIconName: "action:add_contact",
            size: "xx-small"
        }
    ];

    form_B_content = [{
            label: UI_Section_Label_Assets,
            value: "Assets",
            description: "Property, Trusts, Businesses, Investment, Portfolio, Shares, Savings, Source of Wealth",
            iconName: "utility:moneybag",
            splashIconName: "utility:moneybag",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_Liabilities,
            value: "Liabilities",
            description: "Loans, Credit Cards, Contigent Liablities",
            iconName: "utility:money",
            splashIconName: "utility:money",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_Income,
            value: "Income",
            description: "Salary Bonuses",
            iconName: "utility:database",
            splashIconName: "utility:database",
            size: "xx-small"
        },
        {
            label: UI_Section_Label_Expenditure,
            value: "Expenditure",
            description: "Expenditure Details",
            iconName: "standard:client",
            splashIconName: "standard:client",
            size: "xx-small"
        }
    ];


    /* ======================================================== 
    * @method name : startForm() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    startForm() {
        this.entireModal = false;
        const nextEvent = new CustomEvent('nextpage', {
            detail: 'PersonalDetails'
        });

        this.dispatchEvent(nextEvent);

    }


    /* ======================================================== 
    * @method name : handleFormA() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
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


    /* ======================================================== 
    * @method name : handleFormB() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
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


    /* ======================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    renderedCallback() {

    }


    /* ======================================================== 
    * @method name : getStarted() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/
    getStarted() {
        const nextEvent = new CustomEvent('nextpage', {
            detail: 'PersonalDetails'
        });
        this.dispatchEvent(nextEvent);
    }

}