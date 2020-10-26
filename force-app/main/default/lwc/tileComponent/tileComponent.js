import { LightningElement,api,track } from 'lwc';
import ManageInformationUtil from 'c/manageInformationUtil';

// Importing Labels
import UI_Text_Label_RemainMort from '@salesforce/label/c.UI_Text_Label_RemainMort';
import UI_Text_Label_MonPayment from '@salesforce/label/c.UI_Text_Label_MonPayment';

export default class TileComponent extends LightningElement {

	//declaration of public variables
	@api deleteButtonFlag;
	@api utillCmpObject;
    @api addressList=[];
	@api callingPage;
	@api componentName='AddressHistory';

	//declaration of private variables
	@track tileElements=[];

	//Exporting labels
	label = {
	UI_Text_Label_RemainMort,
	UI_Text_Label_MonPayment

	}


	/* ======================================================== 
    * @method name : showPropertyValue() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    get showPropertyValue(){
	    return this.componentName !== 'AddressHistory'?true:false;
	}
	

	/* ======================================================== 
    * @method name : handleEdit() 
    * @author : EY - Gupta 
    * @purpose: 
    * @created date (dd/mm/yyyy) : 05/08/2020 
    ============================================================*/ 
    handleEdit(event){
			const nextEvent = new CustomEvent(event.target.name, {
				bubbles: true,
				composed: true,
				detail: event.currentTarget.dataset.index
			});
			this.dispatchEvent(nextEvent);
    }

}