/*================================================================================== 
    * @template name : addressHistory.js 
    * @author : EY - Ranjith 
    * @purpose: This JS file holds all address history records data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
======================================================================================*/
import { LightningElement, track, api, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';

import saveAddressDetails from '@salesforce/apex/CDDFormController.saveAddressDetails';
import ManageInformationUtil from 'c/manageInformationUtil';
import ADDRESS_OBJECT from '@salesforce/schema/Address__c';
import Addressline1Label from '@salesforce/label/c.Addressline1Label';
import Addressline2Label from '@salesforce/label/c.Addressline2Label';
import AT_ADDRESS_SINCE_FIELD from '@salesforce/schema/Address__c.At_Address_Since__c';
import AT_ADDRESS_TILL_DATE_FIELD from '@salesforce/schema/Address__c.At_Address_Till_Date__c';
import BUILDING_HOUSE_NAME_FIELD from '@salesforce/schema/Address__c.Building_House_Name__c';
import BuildingNumberLabel from '@salesforce/label/c.BuildingNumberLabel';
import ChooseaddressLabel from '@salesforce/label/c.ChooseaddressLabel';
import COUNTRY_FIELD from '@salesforce/schema/Address__c.Country__c';
import FlatLabel from '@salesforce/label/c.FlatLabel';
import getAddressDetails from '@salesforce/apex/AddressDetailsWebService.getAddressDetails';
import MoveindateLabel from '@salesforce/label/c.MoveindateLabel';
import MoveoutdateLabel from '@salesforce/label/c.MoveoutdateLabel';
import POSTCODE_FIELD from '@salesforce/schema/Address__c.PostCode__c';
import PostcodeLabel from '@salesforce/label/c.PostcodeLabel';
import STREET_FIELD from '@salesforce/schema/Address__c.Street__c';
import TOWN_CITY_FIELD from '@salesforce/schema/Address__c.Town_City__c';
import TownCityLabel from '@salesforce/label/c.TownCityLabel';
import UI_Input_Label_CountryPicklist from '@salesforce/label/c.UI_Input_Label_CountryPicklist';
import UI_Input_Label_MODCompare from '@salesforce/label/c.UI_Input_Label_MODCompare';
import UI_Input_Label_MoveInDateError from '@salesforce/label/c.UI_Input_Label_MoveInDateError';
import UI_Input_Label_MoveOutDateError from '@salesforce/label/c.UI_Input_Label_MoveOutDateError';
import UI_Section_Label_AddressHistory from '@salesforce/label/c.UI_Section_Label_AddressHistory';
import UI_Text_Label_3YearsAddr from '@salesforce/label/c.UI_Text_Label_3YearsAddr';
import UI_Text_Label_AddProp from '@salesforce/label/c.UI_Text_Label_AddProp';
import UI_Text_Label_AddrError from '@salesforce/label/c.UI_Text_Label_AddrError';
import UI_Text_Label_CurrentAddrQues from '@salesforce/label/c.UI_Text_Label_CurrentAddrQues';
import UI_Text_Label_DeleteSucess from '@salesforce/label/c.UI_Text_Label_DeleteSucess';
import UI_Text_Label_EditProp from '@salesforce/label/c.UI_Text_Label_EditProp';
import UI_Text_Label_Error from '@salesforce/label/c.UI_Text_Label_Error';
import UI_Text_Label_MoveinMoveoutQues from '@salesforce/label/c.UI_Text_Label_MoveinMoveoutQues';
import UI_Text_Label_MoveInQue from '@salesforce/label/c.UI_Text_Label_MoveInQue';
import UI_Text_Label_RecordTypeErr from '@salesforce/label/c.UI_Text_Label_RecordTypeErr';
import UI_Text_Label_Success from '@salesforce/label/c.UI_Text_Label_Success';
import UI_Button_Label_AddAddrManual from '@salesforce/label/c.UI_Button_Label_AddAddrManual';
import UI_Button_Label_Cancel from '@salesforce/label/c.UI_Button_Label_Cancel';
import UI_Button_Label_AddPrvAddr from '@salesforce/label/c.UI_Button_Label_AddPrvAddr';
import UI_Button_Label_Update from '@salesforce/label/c.UI_Button_Label_Update';
import UI_Button_Label_Next from '@salesforce/label/c.UI_Button_Label_Next';
import UI_Button_Label_AddAddr from '@salesforce/label/c.UI_Button_Label_AddAddr';
import UI_Button_Label_LookupAddr from '@salesforce/label/c.UI_Button_Label_LookupAddr';
import UI_Input_Label_Country from '@salesforce/label/c.UI_Input_Label_Country';
import UI_Text_Label_ChooseAddr from '@salesforce/label/c.UI_Text_Label_ChooseAddr';
import UI_Input_Label_MoveIn from '@salesforce/label/c.UI_Input_Label_MoveIn';
import UI_Input_Label_City from '@salesforce/label/c.UI_Input_Label_City';
import UI_Input_Label_Street from '@salesforce/label/c.UI_Input_Label_Street';
import UI_Input_Label_BuildingName from '@salesforce/label/c.UI_Input_Label_BuildingName';
import UI_Input_Label_BuildingNumber from '@salesforce/label/c.UI_Input_Label_BuildingNumber';
import UI_Input_Label_Flat from '@salesforce/label/c.UI_Input_Label_Flat';
import UI_Input_Label_PostCode from '@salesforce/label/c.UI_Input_Label_PostCode';
import UI_Input_Label_MoveOut from '@salesforce/label/c.UI_Input_Label_MoveOut';


export default class AddressHistory extends LightningElement {

    // Expose the labels to use in the template.
    label = {
        Addressline1Label,
        Addressline2Label,
        BuildingNumberLabel,
        ChooseaddressLabel,
        FlatLabel,
        MoveindateLabel,
        MoveoutdateLabel,
        PostcodeLabel,
        TownCityLabel,
        UI_Input_Label_CountryPicklist,
        UI_Input_Label_MODCompare,
        UI_Input_Label_MoveInDateError,
        UI_Input_Label_MoveOutDateError,
        UI_Section_Label_AddressHistory,
        UI_Text_Label_3YearsAddr,
        UI_Text_Label_AddProp,
        UI_Text_Label_AddrError,
        UI_Text_Label_CurrentAddrQues,
        UI_Text_Label_DeleteSucess,
        UI_Text_Label_EditProp,
        UI_Text_Label_Error,
        UI_Text_Label_MoveinMoveoutQues,
        UI_Text_Label_MoveInQue,
        UI_Text_Label_RecordTypeErr,
        UI_Text_Label_Success,
        UI_Button_Label_AddAddrManual,
        UI_Button_Label_Cancel,
        UI_Button_Label_AddPrvAddr,
        UI_Button_Label_Update,
        UI_Button_Label_Next,
        UI_Button_Label_LookupAddr,
        UI_Input_Label_Country,
        UI_Text_Label_ChooseAddr,
        UI_Input_Label_MoveIn,
        UI_Input_Label_City,
        UI_Input_Label_Street,
        UI_Input_Label_BuildingName,
        UI_Input_Label_BuildingNumber,
        UI_Input_Label_Flat,
        UI_Input_Label_PostCode,
        UI_Input_Label_MoveOut,
        UI_Button_Label_AddAddr
    };

    // declaration of public variables
    @api addressHistoryRequired = this.label.UI_Text_Label_3YearsAddr;
    @api eventData;
    @api hideTile = false;
    @api propertyEditList = [];
    @api propertyPageCall = false;
    @api recordTypeId;
    @api summaryPageCall = false;
    @api utillCmpObject;

    // declaration of private variables
    @track addressQuestion ;//= this.label.UI_Text_Label_CurrentAddrQues;
    @track addressRecordList = [{}];
    @track addressRecordObj = {};
    @track addrListToTile = [{}];
    @track boolAddressNotFound = false;
    @track currentIndex = -1;
    @track hideOnEdit = true;
    @track lstCountry;
    @track lstPostcodes = [];
    @track manualHeader = this.label.UI_Text_Label_AddProp;
    @track minAddressSinceDate;
    @track moveInQuestion;
    @track range;
    @track refreshAddresses;
    @track showAddressDetails = true;
    @track showAddressFields = false;
    @track showLookupAddressFields = false;
    @track showNextButton = false;
    @track showSpinner;
    @track strPostcode;


    /* ======================================================================== 
        * @method name : wire() 
        * @author : EY - Gupta 
        * @purpose: wire method to get RecordTypeId of Address object
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    @wire(getObjectInfo, { objectApiName: ADDRESS_OBJECT })
    getRecordTypeId({ data, error }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        } else if (error) {
            this.toastMessage(this.label.UI_Text_Label_Error, this.label.UI_Text_Label_RecordTypeErr, 'error');
        }
    }


    /* ======================================================================== 
        * @method name : wire() 
        * @author : EY - Gupta 
        * @purpose: wire method to get country picklist values related to recordType
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: COUNTRY_FIELD })
    wirePickList({ data, error }) {
        if (data) {
            this.lstCountry = data.values;
        } else if (error) {
            this.toastMessage(this.label.UI_Text_Label_Error, this.label.UI_Input_Label_CountryPicklist, 'error');
        }
    }


    /* ======================================================================== 
        * @method name : connectedCallback() 
        * @author : EY - Gupta 
        * @purpose: The connectedCallback() lifecycle hook fires when a component 
                    is inserted into the DOM.To Intialize Variables.
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    connectedCallback() {
        if (false === this.propertyPageCall) {
            this.addressRecordList = this.utillCmpObject.formUpdatedData['AddressHistory'];
            if (false === this.hideTile) {
                this.presentStatus();
            }

            //Added for summary page edit-gupta
            if (this.summaryPageCall) {
                this.tileEditHandle(this.eventData);
            }

            if (this.addressRecordList) {
                this.addressQuestion = null;
            }
        } else {
            var editData = JSON.stringify(this.propertyEditList);
            this.addressRecordList = JSON.parse(editData);
            this.tileEditHandle(this.eventData);
        }
    }


    /* ======================================================================== 
     * @method name : handleDeleteProperty() 
     * @author : EY - Gupta 
     * @purpose: The method is used to handle deletion property record in property section
     * @created date (dd/mm/yyyy) : 05/08/2020 
     ============================================================================*/
    handleDeleteProperty(event) {
        event.stopPropagation();
        let record = this.addressRecordList[event.detail];
        if (record.Id) {
            deleteRecord(record.Id);
            this.presentStatus();
        }
        this.addressRecordList.splice(event.detail, 1);
        this.utillCmpObject.formUpdatedData['AddressHistory'] = this.addressRecordList;
                   
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.label.UI_Text_Label_Success,
                message: this.label.UI_Text_Label_DeleteSucess,
                variant: 'success',
            }),
        );
    }

    //property to hide and show till date field
    get tillDateFlag() {
        return this.addressQuestion === null;
    }

    /* ======================================================================== 
        * @method name : tileEditHandle() 
        * @author : EY - Gupta 
        * @purpose: The method is used to handle edit functionality in address and property section
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    tileEditHandle(event) {

        event.stopPropagation(); // stops bubbling upto manageinfo template

        this.currentIndex = event.detail;
        this.addressRecordObj = this.addressRecordList[this.currentIndex];

        if (this.addressRecordObj.Current__c) {
            this.addressQuestion = this.label.UI_Text_Label_CurrentAddrQues;
            this.moveInQuestion = this.label.UI_Text_Label_MoveInQue;
        } else {
            this.addressQuestion = null;
            this.moveInQuestion = this.label.UI_Text_Label_MoveinMoveoutQues;
        }
        console.log('in edit');
        if (this.addressRecordObj.Search_Address__c) {
            console.log(this.addressRecordObj.PostCode__c,'in lookup edit-12',JSON.stringify(this.addressRecordObj));
            this.strPostcode = this.addressRecordObj.PostCode__c;
            this.showSpinner = true;
            console.log('line 275')
        } else {
            console.log('in manual edit');
            this.showAddressFields = true;
            this.showLookupAddressFields = false;
            this.hideOnEdit = false;
            this.showNextButton = false;
            this.showAddressDetails = false;
            this.manualHeader = this.label.UI_Text_Label_EditProp;
        }


    }

   
    /* ======================================================================== 
        * @method name : wire() 
        * @author : EY - Gupta 
        * @purpose: wire method to get list of addresses by searching post-code
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    @wire(getAddressDetails, { strPostalCode: '$strPostcode' })
    loadAdd({ error, data }) {
        if (data) {
            console.log(this.strPostcode,' : called wired method loadAdd325 : ',data);
            if (data.length < 1) {
                this.boolAddressNotFound = true;
                this.showSpinner = false;
            } else if (data) {
                this.boolAddressNotFound = false;
                this.refreshAddresses = data;
                // Get address data
                data.forEach(eachAddress => {
                    var psc = { 'label': eachAddress.address, 'value': eachAddress.id };
                    this.lstPostcodes.push(psc);
                });
                this.showLookupAddressFields = true;
                this.showSpinner = false;

                this.showAddressFields = false;
                this.hideOnEdit = false;
                this.showNextButton = false;
                this.showAddressDetails = false;
                this.manualHeader = this.label.UI_Text_Label_EditProp;
            }
        }
        if (error) {
            console.log('u r wire error',error);
            this.boolAddressNotFound = true; 
            this.showSpinner = false;
        }
    }


    /* ======================================================================== 
        * @method name : handleChange() 
        * @author : EY - Gupta 
        * @purpose: This method gets values of input fields on change
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    handleChange(event) {
        if (this.hideTile) {
            this.addressRecordObj[event.target.name] = event.target.value;
        }
        this.addressRecordObj['Relationship__c'] = this.utillCmpObject.accountId;
        this.addressRecordObj['Type__c'] = 'Home';
        if ('At_Address_Till_Date__c' === event.target.value) {
            this.addressRecordObj['Current__c'] = undefined === event.target.value ? true : false;

        }
        if ('chooseAnAddress' !== event.target.name) {
            this.addressRecordObj[event.target.name] = event.target.value;
        }

        if ('chooseAnAddress' === event.target.name) {
            this.addressRecordObj.Search_Address__c = event.detail.value;
            
            let selectedaddress = event.target.options.find(opt => opt.value === event.detail.value).label;
            var splitAddress = selectedaddress.split(",");
            this.addressRecordObj.Flat__c = splitAddress[0];
            this.addressRecordObj.Building_House_Name__c = splitAddress.length > 4 ? splitAddress[1] : '';
            this.addressRecordObj.Building_House_Number__c = splitAddress.length > 5 ? splitAddress[2] : '';
            this.addressRecordObj.Street__c = splitAddress.length > 4 ? splitAddress[2] : splitAddress[1];
            this.addressRecordObj.Town_City__c = splitAddress.length > 4 ? splitAddress[3] : splitAddress[2];
            this.addressRecordObj.PostCode__c = this.template.querySelector('.postcodelookup').value;
            this.addressRecordObj.Country__c = 'United Kingdom';

        }
       /* if ('At_Address_Since__c' === event.target.name || 'At_Address_Till_Date__c' === event.target.name) {
            var typeOfAddress = this.showAddressFields ? 'manual' : 'lookup';
            let moveOutDate = this.template.querySelector('.' + typeOfAddress + 'TillDate');
            let moveOutDateValue = moveOutDate.value;
            let moveInDate ;
            let today = new Date();
            let dd = String(today.getDate()).padStart(2, '0');
            let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            let yyyy = today.getFullYear();
            today = yyyy + '-' + mm + '-' + dd;

            if ('At_Address_Since__c' === event.target.name) {
                let moveInDateElement = this.template.querySelector('[data-id="moveInDate"]');
                moveInDate = event.target.value;
                if (moveInDate > today) {
                    moveInDateElement.setCustomValidity(this.label.UI_Input_Label_MoveInDateError);
                } else {
                    this.addressRecordObj.At_Address_Since__c = moveInDate;
                    moveInDateElement.setCustomValidity(""); // clear previous value
                } moveInDateElement.reportValidity();
            }
            if ('At_Address_Till_Date__c' === event.target.name) {
                let moveOutDateElement = this.template.querySelector('[data-id="moveOutDate"]');
                let moveOutDate = event.target.value;
                if (moveOutDate > today) {
                    moveOutDateElement.setCustomValidity(this.label.UI_Input_Label_MoveOutDateError);
                } else {
                    this.addressRecordObj.At_Address_Till_Date__c = moveOutDate;
                    moveOutDateElement.setCustomValidity(""); // clear previous value

                } moveOutDateElement.reportValidity();
            }
            console.log('move-in** '+moveInDate +'move-out ***'+moveOutDateValue);
            if (moveInDate > moveOutDateValue) {
                console.log('inside 3rd condition');
                moveOutDate.setCustomValidity(this.label.UI_Input_Label_MODCompare);
            } else {
                moveOutDate.setCustomValidity(""); // clear previous value
            }
            moveOutDate.reportValidity();
        }*/

        this.handleMoveOutBlur();
    }

    handleMoveOutBlur(){
        let moveOutDateElement = this.template.querySelector('[data-id="moveOutDate2"]');
        console.log('on blur');
        console.log(this.addressRecordObj.At_Address_Till_Date__c);
        console.log(this.addressRecordObj.At_Address_Since__c);
        if(this.addressRecordObj.At_Address_Since__c>this.addressRecordObj.At_Address_Till_Date__c){
        moveOutDateElement.setCustomValidity(this.label.UI_Input_Label_MODCompare);
        }else{
            moveOutDateElement.setCustomValidity('');
        }
        
    }


    /* ======================================================================== 
        * @method name : presentStatus() 
        * @author : EY - Gupta 
        * @purpose: This method calculates duration from present address to least date of address history
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    presentStatus() {
        let totalwks = 0;

        this.minAddressSinceDate = undefined;
        this.addressRecordList.map(row => {
            if (row.Current__c) {
                this.addressQuestion = null;
                this.moveInQuestion = this.label.UI_Text_Label_MoveinMoveoutQues;
            }
            if (undefined === this.minAddressSinceDate && undefined !== row.At_Address_Since__c) {
                this.minAddressSinceDate = row.At_Address_Since__c;
            }
            else if (null !== this.minAddressSinceDate && this.minAddressSinceDate > row.At_Address_Since__c) {
                this.minAddressSinceDate = row.At_Address_Since__c;
            }

        });

        this.addressRecordList = this.addressRecordList.map(eachAddr => {

            if (undefined !== eachAddr.At_Address_Since__c) {
                var fromDate = new Date(eachAddr.At_Address_Since__c);
                var difDate;
                var dateDiffText;
                var year;
                var month;
                var yearsStr;
                var monthStr;
                var durationText;

                if (undefined === eachAddr.At_Address_Till_Date__c) {
                    eachAddr.Current__c = true;
                    difDate = new Date(new Date() - fromDate);
                    dateDiffText = eachAddr.At_Address_Since__c + ' - Present ';
                } else {
                    eachAddr.Current__c = false;
                    difDate = new Date(new Date(eachAddr.At_Address_Till_Date__c) - fromDate);
                    dateDiffText = eachAddr.At_Address_Since__c + ' to ' + eachAddr.At_Address_Till_Date__c;
                }
                year = (difDate.toISOString().slice(0, 4) - 1970);
                month = (difDate.getMonth());
                yearsStr = year > 0 ? 1 === year ? year + ' Year ' : year + ' Years ' : '';
                monthStr = month > 0 ? 1 === month ? month + ' Month ' : month + ' Months ' : '';
                durationText = ''
                if ('' !== yearsStr || '' !== monthStr) {
                    durationText = ' ( ' + yearsStr + monthStr + ' ) ';
                }
                return { ...eachAddr, dateDiffTexts: dateDiffText, durationTxts: durationText };
            }

        });

        if (undefined !== this.minAddressSinceDate) {
            var totalDurationDiff = new Date(new Date() - new Date(this.minAddressSinceDate));
            var totalDurationYears = (totalDurationDiff.toISOString().slice(0, 4) - 1970);
            this.showNextButton = totalDurationYears >= 3 ? true : false;
            return this.showNextButton;

        } else {
            this.showNextButton = false;
            return this.showNextButton;
        }

    }


    /* ======================================================================== 
        * @method name : handleCancel() 
        * @author : EY - Gupta 
        * @purpose: This method handles cancel button on manual address entry
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    handleCancel(event) {

        let pagevalid = this.utillCmpObject.validations(this.template, ['lightning-input']);

        if (this.hideTile && ('cancel' === event.target.name || pagevalid)) {
            var data = 'update' === event.target.name ? this.addressRecordList[this.eventData.detail] : null;
            const propertyEvent = new CustomEvent('cancelproperty', {
                bubbles: true,
                composed: true,
                detail: data
            });
            this.dispatchEvent(propertyEvent);
        }
        if ('cancel' === event.target.name || ('cancel' !== event.target.name && pagevalid)) {
            this.showAddressFields = false;
            this.showAddressDetails = true;
            this.hideOnEdit = true;
            this.presentStatus();
        }
    }


    /* ======================================================================== 
        * @method name : handleNext() 
        * @author : EY - Gupta 
        * @purpose: This method handles validating and saving of data 
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    handleNext() {
        let presentStatus = this.presentStatus();

        if (presentStatus) {
            let addData = JSON.stringify(this.addressRecordObj);

            this.addressRecordList.forEach(eachRec => {
                delete eachRec.dateDiffTexts;
                delete eachRec.durationTxts;
                delete eachRec.Current__c;
                eachRec['sObjectType'] = 'Address__c';
            });
            console.log('address list b4 saving *** ', JSON.stringify(this.addressRecordList));
            this.showSpinner = true;
            saveAddressDetails({ strAddress: JSON.stringify(this.addressRecordList) })
                .then((result) => {
                    this.addressRecordList = result;
                    this.utillCmpObject.formUpdatedData['AddressHistory'] = this.addressRecordList;
                    this.showSpinner = false;
                    const nextEvent = new CustomEvent('addressnextpage', {
                        bubbles: true,
                        composed: true,
                        detail: ADDRESS_OBJECT.objectApiName
                    });

                    this.dispatchEvent(nextEvent);
                    this.toastMessage('Success', this.label.UI_Text_Label_KIInvitation, 'success');
                })
                .catch((error) => {
                    this.showSpinner = false;
                    console.log('address list b4 error *** ', JSON.stringify(error));
                    this.toastMessage('Error', this.label.UI_Text_Label_KISendErr, 'error');
                })

            console.log('address list b4 type *** ', JSON.stringify(this.addressRecordList));


        } else if (false === presentStatus) {
            const event = new ShowToastEvent({
                title: this.label.UI_Section_Label_AddressHistory,
                message: this.label.UI_Text_Label_3YearsAddr,
                variant: 'Error',
            });
            this.dispatchEvent(event);

        }
    }


    /* ======================================================================== 
        * @method name : showAddressPage() 
        * @author : EY - Gupta 
        * @purpose: This method handles show and hide of address page 
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    showAddressPage(event) {
        this.currentIndex = -1;
        this.hideOnEdit = true;
        this.addressRecordObj = {};

        if ('manual' === event.target.name) {

            this.template.querySelector('.postcodelookup').required = false;
            this.showAddressFields = true;
            this.showLookupAddressFields = false;
            this.showAddressDetails = false;
            this.showNextButton = false;

        } else if ('lookup' === event.target.name) {
            this.showAddressDetails = true;
            this.showNextButton = false;
            this.template.querySelector('.postcodelookup').required = true;

            if (this.template.querySelector('.postcodelookup').checkValidity()) {
                this.showSpinner = true;

                if (this.strPostcode !== this.template.querySelector('.postcodelookup').value) {
                    this.strPostcode = this.template.querySelector('.postcodelookup').value;
                    this.showAddressFields = false;

                    refreshApex(refreshAddresses);

                } else {
                    this.showSpinner = false;
                    this.showAddressFields = false;

                    if (!this.boolAddressNotFound) {
                        this.showLookupAddressFields = true;
                    }
                }

            } else {
                this.showAddressFields = false;
                this.template.querySelector('.postcodelookup').reportValidity();
            }
        }
    }


    /* ======================================================================== 
        * @method name : addPreviousAddress() 
        * @author : EY - Gupta 
        * @purpose: This method adds address values to the list and displays on tile
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    addPreviousAddress(event) {
        let pagevalid = this.utillCmpObject.validations(this.template, ['lightning-input', 'lightning-combobox']);

        if (pagevalid) {
            if ('lookup' === event.target.name) {
                this.template.querySelector('.postcodelookup').value = '';
            }

            if (false === this.hideTile) { // Condition for property tab formb
                var objRecordData = this.addressRecordList;
                let addData = JSON.stringify(this.addressRecordObj);

                this.addressRecordList = null;

                if (-1 === this.currentIndex) {
                    objRecordData.push(JSON.parse(addData));
                    this.addressRecordList = [...objRecordData];
                }

                this.addressQuestion = null;
                this.moveInQuestion = this.label.UI_Text_Label_MoveinMoveoutQues;
                this.presentStatus();
                this.showAddressFields = false;
                this.showLookupAddressFields = false;
                this.showAddressDetails = true;

            } else { // For Property Tab formb
                const propertyEvent = new CustomEvent('addproperty', {
                    bubbles: true,
                    composed: true,
                    detail: this.addressRecordObj
                });

                this.dispatchEvent(propertyEvent);
            }
        }
    }


    /* ======================================================================== 
        * @method name : todayDate() 
        * @author : EY - Gupta 
        * @purpose: property to get today's date
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
    get todayDate() {

        let todayDate = new Date();
        let dd = String(todayDate.getDate()).padStart(2, '0');
        let mm = String(todayDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = todayDate.getFullYear();

        todayDate = mm + '-' + dd + '-' + yyyy;
        return todayDate;
    }


    /* ======================================================================== 
        * @method name : toastMessage() 
        * @author : EY - Gupta 
        * @purpose: utility method to use toastMessage
        * @created date (dd/mm/yyyy) : 05/08/2020 
        ============================================================================*/
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