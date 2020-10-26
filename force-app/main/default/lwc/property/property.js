import { LightningElement,api,track,wire } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_PropertyPortfolioDetails from '@salesforce/label/c.UI_Text_Label_PropertyPortfolioDetails';
import UI_Input_Label_PropertyCurrentValueQues from '@salesforce/label/c.UI_Input_Label_PropertyCurrentValueQues';
import UI_Text_Label_OutstandingMortgageQues from '@salesforce/label/c.UI_Text_Label_OutstandingMortgageQues';
import UI_Input_Label_OutstandingMortBalQues from '@salesforce/label/c.UI_Input_Label_OutstandingMortBalQues';
import UI_Input_Label_MortgageSumMonPaymentlQues from '@salesforce/label/c.UI_Input_Label_MortgageSumMonPaymentlQues';
import UI_Text_Label_RentalIncomePropertyQues from '@salesforce/label/c.UI_Text_Label_RentalIncomePropertyQues';
import UI_Input_Label_AnnualEarningsQues from '@salesforce/label/c.UI_Input_Label_AnnualEarningsQues';
import UI_Input_Label_MonthlyRentQue from '@salesforce/label/c.UI_Input_Label_MonthlyRentQue';
import UI_Input_Label_BedroomsNumber from '@salesforce/label/c.UI_Input_Label_BedroomsNumber';
import UI_Input_Label_Size from '@salesforce/label/c.UI_Input_Label_Size';
import UI_Input_Label_PropertyType from '@salesforce/label/c.UI_Input_Label_PropertyType';
import UI_Input_Label_FreeholdType from '@salesforce/label/c.UI_Input_Label_FreeholdType';
import UI_Input_Label_LeaseLeftYearsQue from '@salesforce/label/c.UI_Input_Label_LeaseLeftYearsQue';
import UI_Input_Label_EstValueQue from '@salesforce/label/c.UI_Input_Label_EstValueQue';
import UI_Input_Label_MonthlyPaymentQues from '@salesforce/label/c.UI_Input_Label_MonthlyPaymentQues';
import UI_Input_Label_OutstandingAmount from '@salesforce/label/c.UI_Input_Label_OutstandingAmount';
import UI_Input_Label_RentalIncomeEarn from '@salesforce/label/c.UI_Input_Label_RentalIncomeEarn';
import UI_Text_Label_3PropertyAssetQue from '@salesforce/label/c.UI_Text_Label_3PropertyAssetQue';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Text_Label_AddAnotherProperty from '@salesforce/label/c.UI_Text_Label_AddAnotherProperty';
import UI_Button_Label_BulkUpload from '@salesforce/label/c.UI_Button_Label_BulkUpload';

import { getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PROPERTY_TYPE from '@salesforce/schema/Customer_Assets__c.Property_Type__c';
import FREE_LEASE_HOLD from '@salesforce/schema/Customer_Assets__c.Freehold_Leasehold__c';
import CUSTOMER_ASSETS from '@salesforce/schema/Customer_Assets__c';

import bulkUpload from './bulkUpload.html';
import manualPage from './manualEntry.html';

const RADIO_BUTTON_OPTIONS = [
    { 'label': 'Yes', 'value': 'Yes' },
    { 'label': 'No', 'value':  'No' },
];

export default class Property extends LightningElement {
    
    @track lstAllProperties=[]    // Holds all properties for all property tiles
    @track lstTileProperty=[]     // Holds current created property
    @track lstEditRecord=[]       // Holds property selected for editing
    @track eventData=null         // Holds event data from tile edit click
    @track propertyPickList=[]    //Holds property type values
    @track strRecordTypeId         //Holds record type id
    Radio_options = RADIO_BUTTON_OPTIONS

    //Object to intialize fields while adding properties manually
    objPropertyFields={Number_Of_Bedrooms__c:'',
                       Property_Type__c:'',
                       Freehold_Leasehold__c:'',
                       Lease_Left_Years__c:'',
                       Estimated_Current_Value__c:'',
                       Outstanding_Mortgage_Check__c:'',
                       Outstanding_Balance__c:'',
                       Monthly_Payment__c:'',
                       Rental_Income_Check__c:'',
                       Annual_Earnings__c:''
                    };

    @api utillCmpObject;    //Instance variable for utill component

    //Holds all input text labels
    label = {
        UI_Text_Label_PropertyPortfolioDetails,
        UI_Input_Label_PropertyCurrentValueQues,
        UI_Text_Label_OutstandingMortgageQues,
        UI_Input_Label_OutstandingMortBalQues,
        UI_Input_Label_MortgageSumMonPaymentlQues,
        UI_Text_Label_RentalIncomePropertyQues,
        UI_Input_Label_AnnualEarningsQues,
        UI_Input_Label_MonthlyRentQue,
        UI_Input_Label_BedroomsNumber,
        UI_Input_Label_Size,
        UI_Input_Label_PropertyType,
        UI_Input_Label_FreeholdType,
        UI_Input_Label_LeaseLeftYearsQue,
        UI_Input_Label_EstValueQue,
        UI_Input_Label_OutstandingAmount,
        UI_Input_Label_MonthlyPaymentQues,
        UI_Input_Label_RentalIncomeEarn,
        UI_Text_Label_3PropertyAssetQue,
        UI_Text_Label_AddAnotherProperty,
        UI_Button_Label_Next,
        UI_Button_Label_BulkUpload
        
    };

    bolIscurrentAddress;    // To show Property Address fields including ownership radio button
    bolShowPropertyFields;  //To show property fields
    bolShowAllProperties;   // To show All properties tile page
    bolAddProperty;         //To open property address fields page
    bolEditProperty;        //To open property address fields in edit mode
    bolShowBulkUpload;      //Switch between manual/bulkupload html pages

    /* Bulk upload variables */
    bolBulkUploadFields;
    bolBulkUpload;
    @track bulkRecord={}; //Holds bulk record data

    /*for own or rented Property*/
    bolOwnProperty; //For Current address property if selects yes
    bolRentProperty; //For Current address property if selects no

    /* ======================================================== 
    * @method name : render() 
    * @author : EY - Gupta 
    * @purpose: The render() method to switch templates b/w manual and bulk templates.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    render() {
        return this.bolShowBulkUpload ? bulkUpload : manualPage;
    }

    //headerTitle Property to build header title based on page we are showing
    get headerTitle(){
        let streetName = this.lstTileProperty.length != 0?undefined != this.lstTileProperty[0].Street__c?this.lstTileProperty[0].Street__c:this.lstTileProperty[0].Flat__c:'';
        return this.bolShowAllProperties == true
               ?'Your Properties'
               :this.lstTileProperty.length != 0
                    ?this.lstTileProperty[0].Current__c == true
                        ?'Do You Own '+streetName+'?'
                        :streetName
                    :null;

    }

    //this will iddentify present showing property is current address or not
    //If it is current address it shows 'Do you own property' radio buttons
    get ownerShipFlag(){
        return null !== this.objProperty
                ? true === this.objProperty.Current__c 
                ?true
                :false:false; 
    }
    
    //it is a object type to hold current  property address details returned from address history page
    get objProperty(){
        return this.lstTileProperty.length==1?this.lstTileProperty[0]:null;
    }

    // Buttons flag to show next(to move next screen) and adding property button and bulkupload button
    get bolShowButtons(){
        return true === this.bolShowAllProperties
                ? true
                : true === this.bolRentProperty
                    ?this.bolAddProperty != true 
                        ?true
                        :false
                    :false;
    }

    //Activate/Deactivate spinner 
    get showSpinner(){
        return this.propertyPickList && this.ownershipPickList?false:true;
    }

    //Flag to show lease text box
    get showLeaseYears(){
        return null !== this.objProperty
                ?'Leasehold' === this.objProperty.Freehold_Leasehold__c
                    ?true
                    :false
                :false;
    }

   /* Getting PickList values from DB-start */
   @wire(getObjectInfo, { objectApiName: CUSTOMER_ASSETS })
    getRecordTypeId({ data, error }) {
        if (data) {
            const rtis = data.recordTypeInfos;
            this.strRecordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'Property');
        } 
    }

    @wire(getPicklistValues, { recordTypeId: '$strRecordTypeId', fieldApiName: PROPERTY_TYPE })
    getPropertyType({data,error}){
        if(data) {
            data.values.forEach(ele=>{
                if('Bulk Assets' != ele.label){
                    this.propertyPickList.push(ele);
                }
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$strRecordTypeId', fieldApiName: FREE_LEASE_HOLD })
    ownershipPickList;
    /* Getting PickList values from DB-end */
  

    /* ======================================================== 
    * method name : connectedCallback() 
    * author : EY - Gupta 
    * purpose: The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.To Intialize Variables.
    * created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    connectedCallback(){
        //variable Declaration
        let record={};
        let fields={};

        if(0 === this.utillCmpObject.formUpdatedData['Property'].length){

            if(0 < this.utillCmpObject.formUpdatedData['AddressHistory'].length){
                this.utillCmpObject.formUpdatedData['AddressHistory'].forEach(eachRecord=>{
                    if(true === eachRecord.Current__c){
                       record={};
                       record['Building_House_Name__c']=eachRecord.Building_House_Name__c;
                       record['Building_House_Number__c']=eachRecord.Building_House_Number__c;
                       record['Flat__c']=eachRecord.Flat__c;
                       record['Street__c']=eachRecord.Street__c;
                       record['Town_City__c']=eachRecord.Town_City__c;
                       record['PostCode__c']=eachRecord.PostCode__c;
                       record['Country__c']=eachRecord.Country__c;
                       record['Current__c']=eachRecord.Current__c;
                       this.lstTileProperty.push(record);
                       this.resetAllFlags();
                       this.bolIscurrentAddress = true;
                       this.bolShowPropertyFields = true;
                    }
                });
            }

        }else{

            this.lstAllProperties = this.utillCmpObject.formUpdatedData['Property'];
            console.log('stored properties : ',JSON.stringify(this.lstAllProperties));
            //preparing check box values as true or false
            this.lstAllProperties.forEach(eachProperty=>{
                eachProperty['MortagageCheck'] = 'Yes' === eachProperty.Outstanding_Mortgage_Check__c
                                                  ? true
                                                  :'NO' === eachProperty.Outstanding_Mortgage_Check__c
                                                    ?false
                                                    :'';
                eachProperty['RentCheck'] = 'Yes' === eachProperty.Rental_Income_Check__c
                                                  ? true
                                                  :'NO' === eachProperty.Rental_Income_Check__c
                                                    ?false
                                                    :'';
                
                this.bolOwnProperty= 'Yes' === eachProperty.Ownership_Confirmation__c?true:false; // To show all property value fields
                this.bolRentProperty= 'No' === eachProperty.Ownership_Confirmation__c?true:false; // To show property rent field
            });

            this.resetAllFlags();
            this.bolShowAllProperties = true;
        }
     
    }


   /* ======================================================== 
   * method name : handleChange() 
   * author : EY - Gupta 
   * purpose: form element onchange event calls this method to update data to variable.
   * created date (dd/mm/yyyy) : 05/08/2020 
   * param : event - Holds event data of firing form element.
   ============================================================ */ 
   handleChange(event){
    this.objProperty['RecordTypeId']=this.recordTypeId;
    this.objProperty['Relationship__c']=this.utillCmpObject.accountId;
    this.objProperty[event.target.name]=event.target.value;
   
    //To reset data if user switching b/w ownership selection for current address
    if(event.target.name == 'Ownership_Confirmation__c'){

        this.bolOwnProperty=event.target.value=='Yes'?true:false; // To show all property value fields
        this.bolRentProperty=event.target.value == 'No'?true:false; // To show property rent field

        if(event.target.value=='Yes'){
            this.objProperty['Monthly_Rent__c']='';
        }else{
            this.objProperty['Number_Of_Bedrooms__c']='';
            this.objProperty['Size_sqf__c']='';
            this.objProperty['Property_Type__c']='';
            this.objProperty['Freehold_Leasehold__c']='';
            this.objProperty['Estimated_Current_Value__c']='';
            this.objProperty['Lease_Left_Years__c']='';
            this.objProperty['Outstanding_Mortgage_Check__c']='';
            this.objProperty['Outstanding_Balance__c']='';
            this.objProperty['Monthly_Payment__c']='';
            this.objProperty['Rental_Income_Check__c']='';
            this.objProperty['Annual_Earnings__c']='';
        }
    }

    //To reset mortagage fields if he change radio buttons
    if(event.target.name == 'Outstanding_Mortgage_Check__c'){
        console.log('value : ',event.target.value);
            this.objProperty['Outstanding_Balance__c']='';
            this.objProperty['Monthly_Payment__c']='';
            this.objProperty['MortagageCheck'] = 'Yes' == event.target.value
                                                  ? true
                                                  :false 
    }

    //To reset rent field value
    if(event.target.name == 'Rental_Income_Check__c'){
        this.objProperty['Annual_Earnings__c']='';
        this.objProperty['RentCheck'] = 'Yes' == event.target.value
                                        ? true
                                        :false 
    }

}


    /* ======================================================== 
    * @method name : addDetails() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addDetails(){
        console.log('addDetails : ')
        //variable declaration
        let dataTobeSaved;
        let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-radio-group', 'lightning-combobox']);
        if(pageValid){
            console.log('this.eventData : ',this.eventData)
            dataTobeSaved = JSON.stringify(this.objProperty);
            //eventData is not null for update record holds index value
            if(null !== this.eventData){
                this.lstAllProperties.splice(this.eventData.detail,1,JSON.parse(dataTobeSaved));
                this.eventData = null;
            }else{

                //If property is new record we are pushing to list
                this.lstAllProperties.push(JSON.parse(dataTobeSaved));
            }
            
            this.lstTileProperty=[];
            this.resetAllFlags();
            this.bolShowAllProperties = true; // To show all properties screen
        
        }
        this.template.querySelector('.focus').scrollIntoView();
    }


    /* ======================================================== 
    * @method name : addProperty() 
    * @author : EY - Gupta 
    * @purpose: Adds one more record to the list and shows user to add data.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    addProperty(event){
        this.resetAllFlags();

        //Adding property from current property is not owned by user
        if('I own a different Property' === event.currentTarget.dataset.name){
            var dataTobeSaved = JSON.stringify(this.objProperty);
            this.lstAllProperties.push(JSON.parse(dataTobeSaved));
            this.lstTileProperty=[];
        }
        
        this.bolAddProperty = true; // To show add property address fields
        this.template.querySelector('.focus').scrollIntoView();
    }


    /* ======================================================== 
    * @method name : handleAddedAddress() 
    * @author : EY - Gupta 
    * @purpose: To get address fields from address history sections.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleAddedAddress(event){
        //Variable declaration
        let data ={};

        this.resetAllFlags();
        if(event.detail){
            delete event.detail.chooseAnAddress;
        }
        
        data = {...event.detail,...this.objPropertyFields};
        this.lstTileProperty= [];
        this.lstTileProperty.push(data);
        this.bolIscurrentAddress = true;
        this.bolShowPropertyFields = true;
        this.bolOwnProperty = true;
    }


    /* ======================================================== 
    * @method name : tileEditHandle() 
    * @author : EY - Gupta 
    * @purpose: Editing the records in tile 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    tileEditHandle(event){
        this.resetAllFlags();
        let objSelectedProperty = event.target.name == 'currentTile'?this.lstTileProperty[event.detail]:this.lstAllProperties[event.detail];
        if('Bulk Assets' != objSelectedProperty.Property_Type__c){
            console.log(JSON.stringify(this.lstTileProperty),' : tile name : ',event.target.name);
            if(event.target.name == 'currentTile'){
                this.lstEditRecord=this.lstTileProperty;
            }else{
                this.lstEditRecord=this.lstAllProperties;
            }
            this.eventData=event;
            this.bolEditProperty = true;
        }else{
            console.log('data : ',JSON.stringify(objSelectedProperty));
            this.bulkRecord=objSelectedProperty;
            this.handleBulkUpload();
        }
    }


    /* ======================================================== 
    * @method name : handleDeleteProperty() 
    * @author : EY - Gupta 
    * @purpose: Delete the records 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleDeleteProperty(event){
        //variable declaration
        let record;
         event.stopPropagation();

         record = this.lstAllProperties[event.detail];

         //deletes record from database if id is there
         if(record.Id){
            deleteRecord(record.Id);
         }

         //removing record from the ui list
         this.lstAllProperties.splice(event.detail,1);

         this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record Deleted Successfully.',
                variant: 'success',
            }),
          );
    }


    /* ======================================================== 
    * @method name : cancelOrUpdateAddress() 
    * @author : EY - Gupta 
    * @purpose: cancel or update the existing property address fields 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    cancelOrUpdateAddress(event){
        this.resetAllFlags();

        if(event.detail != null){ 
                this.lstTileProperty=[];
                this.lstTileProperty.push(event.detail);
                this.bolIscurrentAddress = true;
                this.bolShowPropertyFields = true;
               
                if('Yes' === event.detail.Ownership_Confirmation__c || ! event.detail.Current__c){
                     this.bolOwnProperty = true;
                } else if('No' === event.detail.Ownership_Confirmation__c){
                    this.bolRentProperty = true;
                }
           
        }else{
            if(this.lstAllProperties.length==0){ 
                this.bolEditProperty = false;                 
                    this.bolIscurrentAddress = true;
                    this.bolShowPropertyFields = true;    
                    this.objProperty.Ownership_Confirmation__c='';
                               
            }else{
                this.bolShowAllProperties = true;
            }
        }
        this.template.querySelector('.focus').scrollIntoView();
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleNext(){
        let bolPageValid;
        if(this.bolRentProperty){
            if(null !== this.eventData){
                this.lstAllProperties.splice(this.eventData.detail,1,this.objProperty);
            }else{
                this.lstAllProperties.push(this.objProperty);
            }
        }
        bolPageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-radio-group', 'lightning-combobox']);
        if (bolPageValid) {

            //Removing check fields show/hide fields
            this.lstAllProperties.forEach(eachProperty=>{
                delete eachProperty.MortagageCheck;
                delete eachProperty.RentCheck;
            });

            this.utillCmpObject.formUpdatedData['Property'] = this.lstAllProperties;
            const nextEvent = new CustomEvent('nextpage', {
                bubbles: true,
                composed: true,
                detail: CUSTOMER_ASSETS.objectApiName
            });
            this.dispatchEvent(nextEvent);
        }
    }


    /* ======================================================== 
    * @method name : resetAllFlags() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    resetAllFlags(){
        this.bolIscurrentAddress=false;
        this.bolShowPropertyFields=false;
        this.bolShowAllProperties=false;
        this.bolAddProperty=false;
        this.bolEditProperty=false;
        this.bolOwnProperty=false;
        this.bolRentProperty=false;
        this.bolShowBulkUpload = false;
        this.bolBulkUpload = false;
    }

    
    /* ======================================================== 
    * @method name : handleBulkUpload() 
    * @author : EY - Gupta 
    * @purpose: BULK UP LOAD Functions
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleBulkUpload(){
        this.lstTileProperty=[{}];
        this.bolShowBulkUpload = true; 
        this.bolBulkUploadFields = true;
        this.template.querySelector('.focus').scrollIntoView();
    }


    /* ======================================================== 
    * @method name : hadnleBulkUpload() 
    * @author : EY - Gupta 
    * @purpose: BULK UP LOAD Functions
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    moveToUploadPage(){
         let pageValid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-radio-group', 'lightning-combobox']);
        if(pageValid){
         this.bolBulkUploadFields = false;
         this.bolBulkUpload = true;
        }
    }


    /* ======================================================== 
    * @method name : handleBulkChange() 
    * @author : EY - Gupta 
    * @purpose: BULK UP LOAD Functions
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleBulkChange(event){
        this.bulkRecord[event.target.name]=event.target.value;

         if(event.target.name == 'Outstanding_Mortgage_Check__c'){
            this.bulkRecord['Outstanding_Balance__c']='';
            this.bulkRecord['Monthly_Payment__c']='';
            this.bulkRecord['MortagageCheck'] = 'Yes' == event.target.value
                                                ? true
                                                :false;
         }
         if(event.target.name == 'Rental_Income_Check__c'){
            this.bulkRecord['Annual_Earnings__c']='';
            this.bulkRecord['RentCheck'] = 'Yes' == event.target.value
                                                ? true
                                                :false;
         }
    }


    /* ======================================================== 
    * @method name : handleCancelBulkUpload() 
    * @author : EY - Gupta 
    * @purpose: BULK UP LOAD Functions
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleCancelBulkUpload(){
        this.resetAllFlags();
        this.bolShowAllProperties = true;
    }


    /* ======================================================== 
    * @method name : handleNextBulkUpload() 
    * @author : EY - Gupta 
    * @purpose: BULK UP LOAD Functions
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleNextBulkUpload(event){
        let isExistingBulkProperty;
        let fields={};
        let returnedData = JSON.parse(event.detail);
        this.lstAllProperties.forEach(eachProperty=>{
            if(eachProperty.Id == returnedData.Id){
                isExistingBulkProperty = true;
            }
        })
        if(!isExistingBulkProperty){
            this.lstAllProperties.push(returnedData);
        }
        this.handleNext();
    }

}