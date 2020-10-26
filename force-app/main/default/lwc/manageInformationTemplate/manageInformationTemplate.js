import { LightningElement,api,track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';
import { createRecord,updateRecord,deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//To delete more than one Record by using apex method
import groupDeleteRecords from '@salesforce/apex/CDDFormController.groupDeleteRecords';

export default class ManageInformationTemplate extends LightningElement {
    
    //Public Properties
    @api lstReentrySections=[];
    @api pathObject=[];                   // Holds all accordian details

    @api utillHelperObject;
    @api strCurrentSection;
    @api isRewriteStage=false;          // User stage of data loading rewriting/initial insertion
    @api strnextSection;                // Holds Next section value

    //Private Properties
    @track strCurrentSectionApiName;
    @track previousSection;             
    @track lstCompletedSection=[];
    @track isCurrentSectionEditable=true;
    @track hasRendered=false;                   //Controlles renderCallback by calling multiple times
    @track addressHistoryEdit=false;           // Summary section address field to open address history in edit mode
    @track addressHistoryEvent;                // Event data to pass addresshistory to make changes
    @track showSpinner=false; 

    //To make all done true to show success page
    get AllDone(){
        return this.pathObject.length == 0 ?true:false;
    }

    /* ======================================================== 
    * @method name : renderedCallback() 
    * @author : EY - Gupta 
    * @purpose: The renderedCallback() lifecycle hook fires every time any action made by user.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    renderedCallback(){
       if('splash' !== this.strCurrentSection  && false === this.hasRendered  && false === this.AllDone && 0 < this.pathObject.length){
            this.lstCompletedSection = this.utillHelperObject.completedSections;
            this.setSectionstatus();
        }
    }


    /* ======================================================== 
    * @method name : onclickSection() 
    * @author : EY - Gupta 
    * @purpose:  Method is to open section by user click
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    onclickSection(event){
        if(event.currentTarget.dataset.name !== this.strCurrentSection){	
            this.previousSection = this.strCurrentSection;
            this.hasRendered = false;
            this.strCurrentSection = event.currentTarget.dataset.name;	
            this.setSectionstatus();	
        }
    }

 
    /* ======================================================== 
    * @method name : setSectionstatus() 
    * @author : EY - Gupta 
    * @purpose:  to set section for user UI and make changes on icons
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    setSectionstatus() {
        let isCurrentSection = false;
        if (false === this.hasRendered) {
            this.strnextSection = 'AllDone';
            this.hasRendered = true;
            let isMainCurrentSection = false;

            //Identifying Sections by looping Path variabble
            this.pathObject.forEach((element,index) => {
                let isMainSectionClosed = true;  // Variable to open Main accordian
                let isMainSectionCompleted = true; // To identify main section is completed or not
                let isSubsection = false;

                // Show/Hide Sections which have sub sections (Form-B)
                if (element.subSection) { 
                    let isPrevioussection =true;
        
                    // Show/hide sub sections based on current section
                    element.subSection.forEach((subelement,subIndex) => { 
                        
                        if(-1 === this.lstCompletedSection.indexOf(subelement.value)){
                            isMainSectionCompleted = false;
                        }

                        var isNextSectionEditable = subelement.isRewrite ? subelement.isRewriteEdit:true;
                        if (isCurrentSection && isNextSectionEditable) {
                                this.strnextSection = subelement.value;
                                isCurrentSection = false;
                                isMainCurrentSection = false;
                        }
                      
                        if (subelement.value === this.strCurrentSection) {
                            
                            if(false === subelement.isRewrite){
                                if(0 !== subIndex ){
                                    this.handleSectionAccess(element.subSection[subIndex-1],subelement);
                                }else if(0 !== index){
                                    var previousSection = this.pathObject[index-1].subSection?this.pathObject[index-1].subSection[this.pathObject[index-1].subSection.length-1]:this.pathObject[index-1];
                                    this.handleSectionAccess(previousSection,subelement);
                                }else{
                                    this.isCurrentSectionEditable=true;
                                }
                            }else{
                                this.isCurrentSectionEditable = subelement.isRewriteEdit;
                            }
                                isCurrentSection = true;
                                isSubsection = true;
                                isPrevioussection = false;
                                isMainSectionClosed = false;
                                this.strCurrentSectionApiName = subelement.apiName;
								this.showHideSections(subelement.value + 'Nav','show',subelement.value,'subsection',false);
                        } else {
								this.showHideSections(subelement.value + 'Nav','hide',subelement.value,'subsection',false);
								
                        }
                    });

                    //Hide Main sections
                    if (isMainSectionClosed) {
						this.showHideSections(element.value + 'Subscreen','hide',element.value,'main',isMainSectionCompleted);
                    } else { // Show main section
						this.showHideSections(element.value + 'Subscreen','show',element.value,'main',false);
                           
                        }
                }

                if(! isSubsection){ // Show/hide main sections which dont have sub sections (Form-A)
                    var isNextSectionEditable = element.isRewrite ? element.isRewriteEdit:true;
                    if (isMainCurrentSection && isNextSectionEditable) {
                        this.strnextSection = element.value;
                        isMainCurrentSection = false; 
                        isCurrentSection = false;
                    }

                    if (this.strCurrentSection == element.value) {
                        if(false == element.isRewrite){
                            if(0 !== index){
                                this.handleSectionAccess(this.pathObject[index-1],element);
                            } else {
                                this.isCurrentSectionEditable=true;
                            }
                        } else {
                            this.isCurrentSectionEditable = element.isRewriteEdit;
                        }
                        this.strCurrentSectionApiName = element.apiName;
                        isCurrentSection = true;
                        isMainCurrentSection = true;
						this.showHideSections(element.value + 'Subscreen','show',element.value,'main',false);
                    
                    } else {
                        if (! element.subSection)
						    this.showHideSections(element.value + 'Subscreen','hide',element.value,'main',false);
                    }
                }
               
    
            });
        }

        if(undefined !== this.strCurrentSection && 'All Done' !== this.strCurrentSection){
            window.scrollTo(0,this.template.querySelector('.' +this.strCurrentSection).offsetTop-60);                           
        } else if('All Done' === this.strCurrentSection){
            this.pathObject = [];
        }
        this.showSpinner = false;
    }


    /* ======================================================== 
        Method Name -handleSectionAccess 
        Purpose -Method decides user has edit access is there or not
        @parameters
        previouseSection - Previously completed section name
        cuurentSection  - Current section when user currently accessing
    ============================================================*/ 
    handleSectionAccess(previouseSection,cuurentSection){
        this.isCurrentSectionEditable=cuurentSection.subSection?true:this.lstCompletedSection.indexOf(previouseSection.value)!=-1?true:false;
    }


    /* ======================================================== 
        Method Name -showHideSection 
        @parameters
        screenClass - class name of the child component's block
        actionType  - Show/Hide based on this param
        currentSection - class name of accordion title block
        section - to identify main/subsection
        isMainSectionCompleted - Boolean variable to know all subsections are completed or not for formb
    ============================================================*/ 
    showHideSections(screenClass,actionType,currentSection,section,isMainSectionCompleted){
        if('show' === actionType){
            this.template.querySelector('.' + screenClass).classList.remove('slds-hide');
            this.template.querySelector('.' + screenClass).classList.add('slds-show');
            // To Add/Remove CSS style for header/title of accordian
            if('main' === section){
                this.template.querySelector('.' + currentSection).classList.add('currentTab');
            }else{
                this.template.querySelector('.' + currentSection).classList.add('currentSubTab');
            }
                this.template.querySelector('.' + currentSection).classList.remove('notstartedTab');
                this.template.querySelector('.' + currentSection).classList.remove('completedTab');
            this.changeAccordionIcons(currentSection,actionType,section,true,isMainSectionCompleted);
        }
        if('hide' === actionType){
            this.template.querySelector('.' + screenClass).classList.add('slds-hide');
            this.template.querySelector('.' + screenClass).classList.remove('slds-show');
            
            // To Add/Remove CSS style for header/title of accordian
            if('main' === section){
                this.template.querySelector('.' + currentSection).classList.remove('currentTab');
            }else{
                this.template.querySelector('.' + currentSection).classList.remove('currentSubTab');
            }
            if(-1 === this.lstCompletedSection.indexOf(currentSection)){
                if(! isMainSectionCompleted){
                    this.template.querySelector('.' + currentSection).classList.add('notstartedTab');
                    this.template.querySelector('.' + currentSection).classList.remove('completedTab');
                } else {
                    this.template.querySelector('.' + currentSection).classList.remove('notstartedTab');
                    this.template.querySelector('.' + currentSection).classList.add('completedTab');
                }
            } else {
                this.template.querySelector('.' + currentSection).classList.remove('notstartedTab');
                this.template.querySelector('.' + currentSection).classList.add('completedTab');
            }
            
            this.changeAccordionIcons(currentSection,actionType,section,false,isMainSectionCompleted);
        }	
    }


    /* ======================================================== 
        Method Name -changeAccordionIcons 
        Purpose : To change Accordion icons based user selection and completion of section
        @parameters
        currentSection - class name of accordion title block
        actionType  - Show/Hide based on this param
        section - to identify main/subsection
        isCurrentSection - is this section is current one or not
        isMainSectionCompleted - Boolean variable to know all subsections are completed or not for formb
    ============================================================*/ 
    changeAccordionIcons(currentSection,actionType,section,isCurrentSection,isMainSectionCompleted){
        //Add/Remove Icons

        //If block works for main section
        if('main' === section){
            
            if(-1 !== this.lstCompletedSection.indexOf(currentSection) && ! isCurrentSection){
              this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-hide');
              this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-show');
            } else {
               
                if(isMainSectionCompleted){
                    this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-hide');
                    this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-show');
                } else {
                    this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-hide');
                    this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-show');
                }
             
            }

            if('show' === actionType){
                this.template.querySelector('.' + currentSection + 'Open').classList.remove('slds-hide');
                this.template.querySelector('.' + currentSection + 'Open').classList.add('slds-show');
            } else {
                this.template.querySelector('.' + currentSection + 'Open').classList.add('slds-hide');
                this.template.querySelector('.' + currentSection + 'Open').classList.remove('slds-show');
            }
        }else if('subsection' === section){ // Else block for sub section
           
            if('show' === actionType){
                this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-hide');
                this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-show');
            } else {
                if(this.lstCompletedSection.indexOf(currentSection) == -1){
                    this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-hide');
                    this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-show');
                } else {
                    this.template.querySelector('.' + currentSection + 'Done').classList.add('slds-show');
                    this.template.querySelector('.' + currentSection + 'Done').classList.remove('slds-hide');
                }
            }

        }
    }


     /* ======================================================== 
    * @method name : handleAddressNext() 
    * @author : EY - Gupta 
    * @purpose: On AddressHistory next button click this method will call from onAddressNext evvent
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleAddressNext(){
        var fields = {};
        this.handleRelationShipUpdate(fields)
    }


    /* ======================================================== 
    * @method name : handleNext() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @parameters
        event - to hold event details from where this method fired
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handlenext(event) {
        this.showSpinner = true;
        var result;
        var fields = {};
        var returnedData = this.utillHelperObject.formUpdatedData[this.strCurrentSection];

        if (returnedData && ('Account' != event.detail || returnedData.length > 0)) {
            var dmlFlag;
            if (returnedData.length) {
                returnedData.forEach((objRecord, index) => {
                    var rd = this.recordParsing(event, objRecord, index, this.strCurrentSection);
    
                });
                this.utillHelperObject.formUpdatedData[this.strCurrentSection] = returnedData;
                dmlFlag = 'done';
    
            } else {
                if (0 !== Object.keys(returnedData).length) {
                    this.recordParsing(event, returnedData, null, this.strCurrentSection);
                }
    
                dmlFlag = 'done';
            }

            if ('done' === dmlFlag) {
                this.handleRelationShipUpdate(fields)
            }
        } else {           
            if (undefined !== returnedData && null !== returnedData && 0 < returnedData.length) {
                var record = returnedData[0];
                Object.keys(record).forEach(element => {
                    if ('object' !== typeof record[element])
                        fields[element] = record[element];
                });
            }
            this.handleRelationShipUpdate(fields)
        }
    }


     /* ======================================================== 
    * @method name : handleRelationShipUpdate() 
    * @author : EY - Gupta 
    * @purpose: To update Relatonship status field
    * @parameters
        fields - hold data to update
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleRelationShipUpdate(fields){
        var result;
        if (this.lstCompletedSection.indexOf(this.strCurrentSection) == -1) {
            this.lstCompletedSection.push(this.strCurrentSection);
        }

        if (this.isRewriteStage) {
            this.returnResendStatus();
            if (0 === this.lstReentrySections.length) {
                fields['Data_Re_entry_Complete__c'] = true;
            }
        } else {
            fields['CDD_Form_Status__c'] = this.returnCompletedSectionLabels(this.lstCompletedSection);
            if (undefined !== this.strCurrentSectionApiName) {
                fields[this.strCurrentSectionApiName] = true;
            }
        }

        fields['Id'] = this.utillHelperObject.accountId;
        if (0 !== Object.keys(fields).length) {
                result = this.hanleUpdateRecord(fields);
            }
        this.utillHelperObject.completedSections = this.lstCompletedSection;
        if ('AllDone' !== this.strnextSection) {
            this.previousSection = this.strCurrentSection;
            this.strCurrentSection = this.strnextSection;
            this.hasRendered = false;
            this.setSectionstatus();
        } else {
            this.strCurrentSection = this.strnextSection;
            this.pathObject = [];
            this.showSpinner = false;
        }

    }


    /* ======================================================== 
    * @method name : returnResendStatus() 
    * @author : EY - Gupta 
    * @purpose: updates user data back to util component and fires an event to ManageInformationTemplate to call next page.
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    returnResendStatus(){
        var completedSection = this.returnCompletedSectionLabels([this.strCurrentSection]);
        var index = this.lstReentrySections.indexOf(completedSection);
        var remainingPages = [];
        this.lstReentrySections.forEach(ele=>{
            if(ele !== completedSection){
                remainingPages.push(ele);
            }
        });
        this.lstReentrySections = remainingPages;
        
    }


    /* ======================================================== 
    * @method name : returnCompletedSectionLabels() 
    * @author : EY - Gupta 
    * @purpose: method gives completed selection label to store it in relation ship object
    * Perameters
    *   lstCompletedSections - List of completed sections
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    returnCompletedSectionLabels(lstCompletedSections){
        let completedSections=[];
        this.pathObject.forEach(element => {
            if(-1 !== lstCompletedSections.indexOf(element.value)){
                completedSections.push(element.label);
            }
            if (element.subSection) {
                element.subSection.forEach(subelement => {
                    if(-1 !== lstCompletedSections.indexOf(subelement.value)){
                        completedSections.push(subelement.label);
                    }
                });
            }
           
        });
        
        if('AllDone' === this.strnextSection && false === this.isRewriteStage){
            if(-1 === lstCompletedSections.indexOf('Submit') && -1 === completedSections.indexOf('completedSections')){
                completedSections.push('Submit');
            }
        }
        if(0 !== completedSections.length){
            return completedSections.toString().replaceAll(",",";");
        }
      
    }


    /* ======================================================== 
    * @method name : recordParsing() 
    * @author : EY - Gupta 
    * @purpose: Parses record to save or update record
    * @parameters
        event - Holds object Api Name
        record - Holds record Data
        index - Index possition of record in the list
        strCurrentSection - Which section currently saving/updating
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    recordParsing(event,record,index,strCurrentSection){
        let fields={}
        let newRecord={}
        if(record.Id == null){
            // create record block
            Object.keys(record).forEach(element=>{
                if( 'object' !== typeof record[element])
                fields[element]= record[element];
            });
            newRecord = { apiName: event.detail, fields };
            return this.saveRecord(newRecord,index,strCurrentSection);
        } else {
            // update record block
            Object.keys(record).forEach(element=>{
                if('object' !== typeof record[element])
                fields[element]= record[element];
            });
            return this.hanleUpdateRecord(fields);
        }
    }


    /* ======================================================== 
    * @method name : hanleUpdateRecord() 
    * @author : EY - Gupta 
    * @purpose: updates record 
    * @parameters
        fields - Record to update
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    hanleUpdateRecord(fields){
        const recordInput = { fields };
        updateRecord(recordInput)
                .then((result) => {
                    return result;
                })
                .catch(error => {
                    this.showSpinner = false;
                });
    }


    /* ======================================================== 
    * @method name : saveRecord() 
    * @author : EY - Gupta 
    * @purpose: Inserts Record
    * @parameters
        recordInput - Record to save
        index - index of the record in the list
        strCurrentSection - which section data is to save
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    saveRecord(recordInput,index,strCurrentSection){
        console.log('Add data : ',JSON.stringify(recordInput));
        createRecord(recordInput)
        .then(result => {
            if(null !== index)
                this.utillHelperObject.formUpdatedData[strCurrentSection][index]['Id']=result.id;
            else
                this.utillHelperObject.formUpdatedData[strCurrentSection]['Id']=result.id;
            return result;
        })
        .catch(error => {
            this.showSpinner = false;
        });
    }


    /* ======================================================== 
    * @method name : handleDeleteRecord() 
    * @author : EY - Gupta 
    * @purpose: Perform Bulk delete of records
    * @parameters
        event - to hold event details from where this method fired
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleDeleteRecord(event){
        this.utillHelperObject.formUpdatedData[this.strCurrentSection]=[];
        groupDeleteRecords({lstIds : event.detail})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                this.handlenext(event);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }


    /* ======================================================== 
    * @method name : handleSummaryAddressEdit() 
    * @author : EY - Gupta 
    * @purpose: Method calls when user clicks on address history record edit icon on summary page
    * @parameters
        event - to hold event details from where this method fired
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */ 
    handleSummaryAddressEdit(event){
        this.addressHistoryEdit=true;
        this.addressHistoryEvent=event;
        this.previousSection = this.strCurrentSection;
        this.strCurrentSection = 'AddressHistory';
        this.hasRendered = false;
        this.setSectionstatus();
    }


    /* ======================================================== 
    * @method name : handleSummaryPage() 
    * @author : EY - Gupta 
    * @purpose: Method calls when user clicks on edit icon on summary page
    * @parameters
        event - to hold event details from where this method fired
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================ */
    handleSummaryPage(event){
        this.hasRendered = false;
        this.previousSection = this.strCurrentSection;
        this.strCurrentSection = event.detail;	
        this.setSectionstatus();
       
    }
}