import { LightningElement, api, track, wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import getFormData from '@salesforce/apex/CDDFormController.getFormData';

// Import labels
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';

import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import Home_Country from '@salesforce/schema/Contact.Home_Country__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
export default class ManageInformation extends LightningElement {

    // Public property Declaration
    @api utillHelperObject;

    // Private property Declaration
    @track startForm = false;
    @track countriesFlag = false;
    @track storedData;
    @track error;
    @track section;
    @track nextSection;
    @track lstAccordions=[];
    recordTypeId;
    @track lstReentrySections=[];
    isRewriteStage = false;

    // Exporting labels
    label = {
        UI_Text_Label_Error
    };

    //property that returns form & Countries
    get mainForm() {
        return this.startForm && this.countriesFlag;
    }

    //property that returns splash
    get templateFlag() {
        return this.section == 'splash' ? false : true;
    }


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get files related logged in user relationShipID
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Individual Contact');
        } else if (error) {
            this.toastMessage(this.label.UI_Text_Label_Error, result.error.body.message, 'error');
        }
    }


    /* ======================================================================== 
    * @method name : wire() 
    * @author : EY - Gupta
    * @purpose: wire method to get picklist values
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: Home_Country })
    wirePickList({ data, error }) {
        if (data) {
            this.utillHelperObject.countryPickList = data.values;
            this.countriesFlag = true;
        } else if (error) {
            this.toastMessage(this.label.UI_Text_Label_Error, result.error.body.message, 'error');
        }
    }


    /* ======================================================== 
    * @method name : connectedCallback() 
    * @author : EY - Gupta 
    * @purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    connectedCallback(){
        getFormData()
            .then((data)=>{
                var formStatus=[];
                var returnData = JSON.parse(data);
                returnData.lstMdtErrorMessages.forEach(element => {
                    this.utillHelperObject.objErrorMessages[element.DeveloperName] = element.Error_Message__c;
                });
                this.utillHelperObject.formUpdatedData['Property']=[];
                this.utillHelperObject.formUpdatedData['Business']=[];
                this.utillHelperObject.formUpdatedData['Trust']=[];
                this.utillHelperObject.formUpdatedData['CreditCards']=[];
                this.utillHelperObject.formUpdatedData['ContigentLiabilities']=[];
                this.utillHelperObject.formUpdatedData['OtherLiabilities']=[];
                this.utillHelperObject.formUpdatedData['Loans']=[];
                this.utillHelperObject.formUpdatedData['InvestmentPortfolios']=[];
                this.utillHelperObject.formUpdatedData['Shares']=[];
                this.utillHelperObject.formUpdatedData['Savings']=[];
                this.utillHelperObject.formUpdatedData['OtherAssets']=[];
                this.utillHelperObject.formUpdatedData['SourceOfWealth']=[];
                this.utillHelperObject.formUpdatedData['Salary']=[];
                this.utillHelperObject.formUpdatedData['Expenditure']=[];
                this.utillHelperObject.formUpdatedData['AdditionalDetails']=[];
                this.utillHelperObject.formUpdatedData['Summary']=[];
    
                this.utillHelperObject.formUpdatedData['PersonalDetails'] = returnData.objContact;
                this.utillHelperObject.formUpdatedData['AddressHistory'] = returnData.lstAddressHistory;
                this.utillHelperObject.formUpdatedData['TaxDetails'] = returnData.lstCitizenship;
                this.utillHelperObject.formUpdatedData['AdditionalDetails'].push(returnData.objAdditionaldetails);
                this.utillHelperObject.formUpdatedData['Summary'].push(returnData.objAdditionaldetails);
    
                returnData.lstAssets.forEach(eachAsset=>{
                        this.utillHelperObject.formUpdatedData[eachAsset.RecordType.Name].push(eachAsset);
                });
    
                returnData.lstLiabilities.forEach(eachLiability=>{
                    if(null !== eachLiability.RecordType.Name){
                        var pageName = eachLiability.RecordType.Name.replace(/ /g, "");
                        this.utillHelperObject.formUpdatedData[pageName].push(eachLiability);
                    }
                });

                returnData.lstOtherAssets.forEach(eachotherasset=>{
                    if(null !== eachotherasset.RecordType.Name){
                        var pageName = eachotherasset.RecordType.Name.replace(/ /g, "");
                        pageName = pageName ==='Investment'?'InvestmentPortfolios':pageName;
                        this.utillHelperObject.formUpdatedData[pageName].push(eachotherasset);
                    }
                });
    
                returnData.lstIncomeExpenditure.forEach(eachSalary=>{
                    if(null !== eachSalary.RecordType.Name){
                        var pageName = eachSalary.RecordType.Name;
                        this.utillHelperObject.formUpdatedData[pageName].push(eachSalary);
                    }
                });
    
                this.utillHelperObject.uploadedFiles = returnData.lstFilesList;
                formStatus = returnData.objAdditionaldetails.CDD_Form_Status__c;
                var ReentrySections = returnData.objAdditionaldetails.CDD_Data_Re_entry_Sections__c;
    
                if(undefined === formStatus){
                    this.findSection(formStatus);
                } else if(-1 === formStatus.indexOf('Submit')){
                    this.findSection(formStatus);
                } else if('undefined' !== typeof ReentrySections && null !== ReentrySections 
                         && false === returnData.objAdditionaldetails.Data_Re_entry_Complete__c){
                    this.lstReentrySections = ReentrySections.split(';');
                    this.isRewriteStage = true;
                    this.reEntrySection(this.lstReentrySections);
                } else {
                    this.lstAccordions = [];
                    this.section='All Done';
                }
                
                this.storedData = data;
                this.error = undefined;
                this.startForm = true;
                
            })
            .catch((error)=>{
                
            });
    }


    /* ======================================================== 
    * @method name : setAccordions() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    setAccordions(){
        if(this.utillHelperObject.showFormb){
            this.lstAccordions =[...this.utillHelperObject.formAmenu,...this.utillHelperObject.formBmenu];
        } else {
            this.lstAccordions = this.utillHelperObject.formAmenu;
        }
    }



    /* ======================================================== 
    * @method name : handleGetStarted() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleGetStarted(event) {
        this.section = event.detail;
    }
    

    /* ======================================================== 
    * @method name : reEntrySection() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    reEntrySection(reEntrySections){
        let lstCompletedSections = [];
        this.setAccordions();
        this.lstAccordions.forEach(eachSection=>{
            if (eachSection.subSection) {
                eachSection.subSection.forEach(eachSub => {
                    if(-1 !== reEntrySections.indexOf(eachSub.label)){
                        if(undefined === this.section){
                            this.section = eachSub.value;
                        }
                        eachSub.isRewrite = true;
                        eachSub.isRewriteEdit = true;
                    } else {
                        lstCompletedSections.push(eachSub.value);
                        eachSub.isRewrite = true;
                        eachSub.isRewriteEdit = false;
                    }

                });
            }
                if(-1 !== reEntrySections.indexOf(eachSection.label)){
                    if(undefined === this.section){
                        this.section = eachSection.value;
                    }
                    eachSection.isRewrite = true;
                    eachSection.isRewriteEdit = true;
                } else {
                    lstCompletedSections.push(eachSection.value);
                    eachSection.isRewrite = true;
                    eachSection.isRewriteEdit = false;
                }
            
        });
        this.utillHelperObject.completedSections = [...lstCompletedSections];
    }


    /* ======================================================== 
    * @method name : findSection() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    findSection(strFormStatus) {
        let allForms;
        let strFormName;
        let lstCompletedSections = [];
        let strPaeName;
        var strNextSection = null;
        var strNextAfterSection = null;
        this.setAccordions();
        if (strFormStatus) {
            if (this.lstAccordions) {
                this.lstAccordions.forEach(eachSection => {
                    if (eachSection.subSection) {
                        eachSection.subSection.forEach(eachSub => {
                            if (-1 !== strFormStatus.indexOf(eachSub.label)) {
                                lstCompletedSections.push(eachSub.value);
                            } else {
                                if (null === strNextSection)
                                    strNextSection = eachSub.value;
                                if (null !== strNextSection && null === strNextAfterSection)
                                    strNextAfterSection = eachSub.value;
                            }
                        });
                    } else {
                        if (-1 !== strFormStatus.indexOf(eachSection.label)) {
                            lstCompletedSections.push(eachSection.value);
                        } else {
                            if (null === strNextSection)
                                strNextSection = eachSection.value;
                            if (null !== strNextSection && null === strNextAfterSection)
                                strNextAfterSection = eachSection.value;
                        }
                    }
                });
            }
        } else {
            strNextSection='splash'
        }
        if (strNextSection) {
            this.utillHelperObject.completedSections = [...lstCompletedSections];
            this.section = strNextSection;
            this.nextSection = strNextAfterSection;
        } else {
            this.section='All Done';
        }
        
    }
}