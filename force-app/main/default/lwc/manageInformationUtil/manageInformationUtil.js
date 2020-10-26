/* ======================================================== 
    * file name :  ManageInformationUtil
    * author : EY - Gupta 
    * purpose: Shared Js file for CDD Form to share data b/w different sections
    * created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 

//importing lables
import UI_Section_Label_PI from '@salesforce/label/c.UI_Section_Label_PI';
import UI_Accordion_Label_AH from '@salesforce/label/c.UI_Accordion_Label_AH';
import UI_Accordion_Label_TD from '@salesforce/label/c.UI_Accordion_Label_TD';
import UI_Accordion_Label_AD from '@salesforce/label/c.UI_Accordion_Label_AD';
import UI_Accordion_Label_SD from '@salesforce/label/c.UI_Accordion_Label_SD';
import UI_Section_Label_Summary from '@salesforce/label/c.UI_Section_Label_Summary';
import UI_Section_Label_Assets from '@salesforce/label/c.UI_Section_Label_Assets';
import UI_Section_Label_Liabilities from '@salesforce/label/c.UI_Section_Label_Liabilities';
import UI_Section_Label_Income from '@salesforce/label/c.UI_Section_Label_Income';
import UI_Section_Label_Expenditure from '@salesforce/label/c.UI_Section_Label_Expenditure';
import UI_Section_Label_SupportingDocuments from '@salesforce/label/c.UI_Section_Label_SupportingDocuments';
import UI_Section_Label_Property from '@salesforce/label/c.UI_Section_Label_Property';
import UI_Section_Label_Trust from '@salesforce/label/c.UI_Section_Label_Trust';
import UI_Section_Label_Savings from '@salesforce/label/c.UI_Section_Label_Savings';
import UI_Section_Label_Business from '@salesforce/label/c.UI_Section_Label_Business';
import UI_Section_Label_InvestPortfolio from '@salesforce/label/c.UI_Section_Label_InvestPortfolio';
import UI_Section_Label_Shares from '@salesforce/label/c.UI_Section_Label_Shares';
import UI_Section_Label_OtherAsset from '@salesforce/label/c.UI_Section_Label_OtherAsset';
import UI_Text_Label_SourceOfWealth from '@salesforce/label/c.UI_Text_Label_SourceOfWealth';
import UI_Section_Label_ExistingLiabilities from '@salesforce/label/c.UI_Section_Label_ExistingLiabilities';
import UI_Section_Label_Loans  from '@salesforce/label/c.UI_Section_Label_Loans';
import UI_Section_Label_CreditCards from '@salesforce/label/c.UI_Section_Label_CreditCards';
import UI_Section_Label_ContinLiability from '@salesforce/label/c.UI_Section_Label_ContinLiability';
import UI_Section_Label_OtherLiability from '@salesforce/label/c.UI_Section_Label_OtherLiability';
import UI_Section_Label_KnownIncome from '@salesforce/label/c.UI_Section_Label_KnownIncome';

export default class ManageInformationUtil {
    objErrorMessages = {};//Form Fields Error Messages
    formUpdatedData = {}; //Variable to store form loading data and updating data
    ContactId;            // Logged in user Contact Id
    accountId;            //Logged in user Account Id
    showFormb;            //Stores User has form b access or not
    countryPickList;      //Stores List of countries
    completedSections = []; // Stores All Completed Sections
    uploadedFiles = [];     //List of supporting documents
    summaryPageRecord = {};  // To store Summary page documents
    lstAddressHistory = [{}]; //While click on edit address on summary page holds address details

    //Form Access based on roles
    formAroles = ['Director', 'Designated Member','Controllers'];
    formBroles = ['Shareholder', 'Legal Owner', 'UBO', 'Guarantor'];

    // Form A mainMenu start
    formAmenu =  [{
                UIlabel: UI_Section_Label_PI,
                label: 'Personal Information', 
                value: 'PersonalDetails',
                class: 'slds-hide PersonalDetailsSubscreen',
                className: 'PersonalDetailsNav slds-hide',
                iconPath: "/_slds/icons/standard-sprite/svg/symbols.svg#individual",
                completedIcon: 'PersonalDetailsDone slds-hide',
                openSectionIcon: 'PersonalDetailsOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName:'Form_A_Personal_Information__c'
            },
            {
                UIlabel: UI_Accordion_Label_AH,
                label: 'Address History',
                value: 'AddressHistory',
                class: 'slds-hide AddressHistorySubscreen',
                className: 'AddressHistoryNav slds-hide',
                iconPath: "/_slds/icons/standard-sprite/svg/symbols.svg#address",
                completedIcon: 'AddressHistoryDone slds-hide',
                openSectionIcon: 'AddressHistoryOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_A_Address_Details__c'
            },
            {
                UIlabel: UI_Accordion_Label_TD,
                label: 'Tax Details',
                value: 'TaxDetails',
                class: 'slds-hide TaxDetailsSubscreen',
                className: 'TaxDetailsNav slds-hide',
                iconPath: "/_slds/icons/standard-sprite/svg/symbols.svg#record",
                completedIcon: 'TaxDetailsDone slds-hide',
                openSectionIcon: 'TaxDetailsOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_A_Citizenship_Details__c'
            },
            {
                UIlabel: UI_Accordion_Label_AD,
                label: 'Additional Details',
                value: 'AdditionalDetails',
                class: 'slds-hide AdditionalDetailsSubscreen',
                className: 'AdditionalDetailsNav slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#new_note",
                completedIcon: 'AdditionalDetailsDone slds-hide',
                openSectionIcon: 'AdditionalDetailsOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_A_Additional_Details__c'

            },
            {
                UIlabel: UI_Section_Label_SupportingDocuments,
                label: 'Supporting Documents',
                value: 'SupportingDocuments',
                class: 'slds-hide SupportingDocumentsSubscreen',
                className: 'SupportingDocumentsNav slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                completedIcon: 'SupportingDocumentsDone slds-hide',
                openSectionIcon: 'SupportingDocumentsOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_A_Upload_Documents__c'
            },
            {
                UIlabel: UI_Section_Label_Summary,
                label: 'Summary',
                value: 'Summary',
                class: 'slds-hide SummarySubscreen',
                className: 'SummaryNav slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#new_task",
                completedIcon: 'SummaryDone slds-hide',
                openSectionIcon: 'SummaryOpen slds-hide',
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_A_Summary_Page__c'
            }
        ];
    //Form A Main menu End

    //Form B Sub sections Start
    assetsOptionList = () => {
        return [{
                UIlabel: UI_Section_Label_Property,
                label: 'Property',
                value: 'Property',
                iconName: 'utility:home',
                className: 'PropertyNav slds-hide',
                completedIcon: 'PropertyDone slds-hide',
                iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#home",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Property_Details__c'
            },
            {
                UIlabel: UI_Section_Label_Trust,
                label: 'Trusts',
                value: 'Trust',
                iconName: 'utility:touch_action',
                className: 'TrustNav slds-hide',
                completedIcon: 'TrustDone slds-hide',
                iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#touch_action",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Trust_Details__c'
            },
            {
                UIlabel: UI_Section_Label_Business,
                label: 'Businesses',
                value: 'Business',
                iconName: 'utility:bold',
                className: 'BusinessNav slds-hide',
                completedIcon: 'BusinessDone slds-hide',
                iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#bold",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Business_Details__c'
            },
            {
                UIlabel: UI_Section_Label_InvestPortfolio,
                label: 'Investment Portfolios',
                value: 'InvestmentPortfolios',
                iconName: 'utility:info',
                className: 'InvestmentPortfoliosNav slds-hide',
                completedIcon: 'InvestmentPortfoliosDone slds-hide',
                iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Investment_Details__c'
            },
            {
                UIlabel: UI_Section_Label_Shares,
                label: 'Shares',
                value: 'Shares',
                iconName: 'utility:share',
                className: 'SharesNav slds-hide',
                completedIcon: 'SharesDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Share_Details__c'
            },
            {
                UIlabel: UI_Section_Label_Savings,
                label: 'Savings',
                value: 'Savings',
                iconName: 'utility:save',
                className: 'SavingsNav slds-hide',
                completedIcon: 'SavingsDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Saving_Details__c'
            },
            {
                UIlabel: UI_Section_Label_OtherAsset,
                label: 'Other Assets',
                value: 'OtherAssets',
                iconName: 'utility:archive',
                className: 'OtherAssetsNav slds-hide',
                completedIcon: 'OtherAssetsDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Other_Asset_Details__c'
            },
            {
                UIlabel: UI_Text_Label_SourceOfWealth,
                label: 'Source Of Wealth',
                value: 'SourceOfWealth',
                iconName: 'utility:weeklyview',
                className: 'SourceOfWealthNav slds-hide',
                completedIcon: 'SourceOfWealthDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Source_Of_Wealth__c'
            }
        ];
    };
    liabilitiesOptionList = () => {
        return [{
                UIlabel: UI_Section_Label_ExistingLiabilities,
                label: 'Existing Liabilities',
                value: 'ExistingLiability',
                iconName: 'utility:watchlist',
                className: 'ExistingLiabilityNav slds-hide',
                completedIcon: 'ExistingLiabilityDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: undefined
            },
             {
                UIlabel: UI_Section_Label_Loans,
                label: 'Loans',
                value: 'Loans',
                iconName: 'utility:watchlist',
                className: 'LoansNav slds-hide',
                completedIcon: 'LoansDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Loan_Details__c'
            },
            {
                UIlabel: UI_Section_Label_CreditCards,
                label: 'Credit Cards',
                value: 'CreditCards',
                className: 'CreditCardsNav slds-hide',
                completedIcon: 'CreditCardsDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Credit_Cards_Details__c'
            },
            {
                UIlabel: UI_Section_Label_ContinLiability,
                label: 'Contigent Liabilities',
                value: 'ContigentLiabilities',
                splashIconName: 'utility:bold',
                className: 'ContigentLiabilitiesNav slds-hide',
                completedIcon: 'ContigentLiabilitiesDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Contingent_Liability__c'
            },
            {
                UIlabel: UI_Section_Label_OtherLiability,
                label: 'Other Liabilities',
                value: 'OtherLiabilities',
                splashIconName: 'utility:bold',
                className: 'OtherLiabilitiesNav slds-hide',
                completedIcon: 'OtherLiabilitiesDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Other_Liability_Details__c'
            }
        ];
    };
    incomeOptionList = () => {
        return [{
                UIlabel: UI_Section_Label_KnownIncome,
                label: 'Known Income',
                value: 'Salary',
                splashIconName: 'utility:home',
                className: 'SalaryNav slds-hide',
                completedIcon: 'SalaryDone slds-hide',
                iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
                isRewrite:false,
                isRewriteEdit:false,
                apiName: 'Form_B_Salary_Details__c'
            }
            
        ];
    };
    expenditureOptionList = () => {
        return [{
            UIlabel: UI_Section_Label_Expenditure,
            label: 'Expenditure',
            value: 'Expenditure',
            splashIconName: 'utility:home',
            className: 'ExpenditureNav slds-hide',
            completedIcon: 'ExpenditureDone slds-hide',
            iconPath: "/_slds/icons/action-sprite/svg/symbols.svg#add_contact",
            isRewrite:false,
            isRewriteEdit:false,
            apiName: 'Form_B_Expenditure_Details__c'
        }];
    };
    //Form B Sub sections End

    //Form B Main menu Start
    formBmenu = [{
            UIlabel: UI_Section_Label_Assets,
            label: 'Assets',
            value: 'Assets',
            subSection: this.assetsOptionList(),
            class: 'slds-hide AssetsSubscreen',
            className: 'Assets mainTitle',
            iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#moneybag",
            completedIcon: 'AssetsDone slds-hide',
            openSectionIcon: 'AssetsOpen slds-hide',
            isRewrite:false,
            isRewriteEdit:false,
            apiName: undefined
        },
        {
            UIlabel: UI_Section_Label_Liabilities,
            label: 'Liabilities',
            value: 'Liabilities',
            screenClass: 'LiabilitiesOwn slds-hide',
            subSection: this.liabilitiesOptionList(),
            class: 'slds-hide LiabilitiesSubscreen',
            className: 'Liabilities mainTitle',
            iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#money",
            completedIcon: 'LiabilitiesDone slds-hide',
            openSectionIcon: 'LiabilitiesOpen slds-hide',
            isRewrite:false,
            isRewriteEdit:false,
            apiName: undefined
        },
        {
            UIlabel: UI_Section_Label_Income,
            label: 'Income',
            value: 'Income',
            screenClass: 'IncomeOwn slds-hide',
            subSection: this.incomeOptionList(),
            class: 'slds-hide IncomeSubscreen',
            className: 'Income mainTitle',
            iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#database",
            completedIcon: 'IncomeDone slds-hide',
            openSectionIcon: 'IncomeOpen slds-hide',
            isRewrite:false,
            isRewriteEdit:false,
            apiName: undefined
        },
        {
            UIlabel: UI_Section_Label_Expenditure,
            label: 'Expenditure',
            value: 'ExpenditureMain',
            subSection:this.expenditureOptionList(),
            class: 'slds-hide ExpenditureMainSubscreen',
            splashIconName: 'utility:food_and_drink',
            className: 'ExpenditureMain mainTitle',
            iconPath: "/_slds/icons/utility-sprite/svg/symbols.svg#food_and_drink",
            completedIcon: 'ExpenditureMainDone slds-hide',
            openSectionIcon: 'ExpenditureMainOpen slds-hide',
            isRewrite:false,
            isRewriteEdit:false,
            apiName: undefined
        }
    ];
    //Form B Main menu End


    /* ======================================================== 
    * method name : validations() 
    * author : EY - Gupta 
    * purpose: To validate every field in the form.
    * parameters
        arrHtmlElements - Accepts this.template to hold all html elements
        lstElements  -Which all elements to check validations
    * created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    validations(arrHtmlElements, lstElements) {
        var allValid = true;
        if (lstElements.length != 0) {
            lstElements.forEach(element => {
                allValid = [...arrHtmlElements.querySelectorAll(element)]
                    .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
                    }, allValid);
            });
        }

        return allValid;
    }
}