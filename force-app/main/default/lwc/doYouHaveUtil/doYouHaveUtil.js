/*======================================================== 
    * @template name : doYouHaveUtil.js 
    * @author : EY - Sai Kumar 
    * @purpose: This JS file holds all radio button records data.
    * @created date (dd/mm/yyyy) : 20/08/2020 
============================================================*/

import { LightningElement,api } from 'lwc';

export default class DoYouHaveUtil extends LightningElement {
    
    @api headerQuestion;
    @api description;
    @api radioFlag;
    
    options = [
        { 'label': 'Yes', 'value': 'Yes' },
        { 'label': 'No', 'value': 'No' }
    ];  


  /* ======================================================== 
   * @method name : handleChange() 
   * @author : EY - Gupta 
   * @purpose: form element onchange event calls this method to update data to variable.
   * @created date (dd/mm/yyyy) : 05/08/2020 
   * @param : event - Holds event data of firing form element.
   ============================================================ */
    handleChange(event){
        this.radioFlag = event.target.value;

        const nextEvent = new CustomEvent('handleselection', {
            detail: event.target.value
        });

       this.dispatchEvent(nextEvent);
    }
}