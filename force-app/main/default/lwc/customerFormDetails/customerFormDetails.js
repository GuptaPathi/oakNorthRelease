/* ================================================================================== 
    * @template name : customerFormDetails.js 
    * @author : EY - Ranjith 
    * @purpose: This js file loads/shows all the components related to formA and formB
    *           based on current section selected.
    * @created date (dd/mm/yyyy) : 20/08/2020 
======================================================================================*/
import { LightningElement, api } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

export default class CustomerFormDetails extends LightningElement {

  //declaration of public variables
  @api currentPage;
  @api strCurrentSection;
  @api utillCmpObject;
  @api addressHistoryEdit=false;
  @api addressHistoryEvent;
  @api isCurrentSectionEditable; 
  @api previousSection;

  //declaration of private variables
  fieldset = '';


   /* ======================================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Gupta 
    * @purpose: The renderedCallback() lifecycle hook fires when a component 
                is inserted/modified into the DOM.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
  renderedCallback() {

    if (this.currentPage && this.template.querySelector('.'  + this.currentPage) != null) {
      this.template.querySelector('.' + this.currentPage).classList.remove('slds-hide');
      this.template.querySelector('.'  + this.currentPage).classList.add('slds-show');
    }

    if(! this.isCurrentSectionEditable){
      
      this.template.querySelector('.'+this.currentPage).classList.add('readonly');
      this.fieldset='disabled';
      }else{

      this.template.querySelector('.'+this.currentPage).classList.remove('readonly');
      this.fieldset='';
      }
  }


  /* ======================================================================== 
    * @method name : properties 
    * @author : EY - Gupta 
    * @purpose: These below properties checks the current section and show/hide
    *           related template/div in html
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================================*/
  get showPersonalInfo() {
    return (this.currentPage === this.strCurrentSection && 'PersonalDetails' === this.strCurrentSection ) ? true : false;
  }


  get showAddressHistory() {
    return (this.currentPage === this.strCurrentSection && 'AddressHistory' === this.strCurrentSection ) ? true : false;
  }


  get showTaxDetails() {
    return (this.currentPage === this.strCurrentSection && 'TaxDetails' === this.strCurrentSection ) ? true : false;
  }


  get showAdditionalDetails() {
    return (this.currentPage === this.strCurrentSection && 'AdditionalDetails' === this.strCurrentSection ) ? true : false;
  }


  get showUploadDocuments() {
    return (this.currentPage === this.strCurrentSection && 'SupportingDocuments' === this.strCurrentSection ) ? true : false;
  }


  get showSummaryPage() {
    return (this.currentPage === this.strCurrentSection && 'Summary' === this.strCurrentSection ) ? true : false;
  }


  get showPropertyPage() {
    return (this.currentPage === this.strCurrentSection && 'Property' === this.strCurrentSection ) ? true : false;
  }


  get showTrustsPage() {
    return (this.currentPage === this.strCurrentSection && 'Trust' === this.strCurrentSection ) ? true : false;
  }


  get showBusinessPage() {
    return (this.currentPage === this.strCurrentSection && 'Business' === this.strCurrentSection ) ? true : false;
  }


  get showInvestmentPortfoliosPage() {
    return (this.currentPage === this.strCurrentSection && 'InvestmentPortfolios' === this.strCurrentSection ) ? true : false;
  }


  get showSharesPage() {
    return (this.currentPage === this.strCurrentSection && 'Shares' === this.strCurrentSection ) ? true : false;
  }


  get showSavingsPage() {
    return (this.currentPage === this.strCurrentSection && 'Savings' === this.strCurrentSection ) ? true : false;
  }


  get showOtherAssetsPage() {
    return (this.currentPage === this.strCurrentSection && 'OtherAssets' === this.strCurrentSection ) ? true : false;
  }


  get showSourceOfWealthPage() {
    return (this.currentPage === this.strCurrentSection && 'SourceOfWealth' === this.strCurrentSection ) ? true : false;
  }


  get showExistingLiabilityPage() {
    return (this.currentPage === this.strCurrentSection && 'ExistingLiability' === this.strCurrentSection ) ? true : false;
  }


  get showLoansPage() {
    return (this.currentPage === this.strCurrentSection && 'Loans' === this.strCurrentSection ) ? true : false;
  }


  get showCreditCardsPage() {
    return (this.currentPage === this.strCurrentSection && 'CreditCards' === this.strCurrentSection ) ? true : false;
  }


  get showContingentLiabilitiesPage() {
    return (this.currentPage === this.strCurrentSection && 'ContigentLiabilities' === this.strCurrentSection ) ? true : false;
  }


  get showOtherLiabilitiesPage() {
    return (this.currentPage === this.strCurrentSection && 'OtherLiabilities' === this.strCurrentSection ) ? true : false;
  }


  get showSalaryPage() {
    return (this.currentPage === this.strCurrentSection && 'Salary' === this.strCurrentSection ) ? true : false;
  }


  get showExpenditurePage() {
    return (this.currentPage === this.strCurrentSection && 'Expenditure' === this.strCurrentSection ) ? true : false;
  }


  get showIncomeSummaryPage() {
    return (this.currentPage === this.strCurrentSection && 'IncomeSummary' === this.strCurrentSection ) ? true : false;
  }
  
}