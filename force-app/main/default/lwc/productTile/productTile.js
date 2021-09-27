import { LightningElement,api } from 'lwc';

export default class ProductTile extends LightningElement {
    _product;
    /** Product__c to display. */
    @api
    get product() {
        return this._product;
    }
    set product(value) {
        this._product = value;
        this.pictureUrl = value.DisplayUrl;
        this.name = value.Name;
        this.price = value.Price__c;
    }

    /** Product__c field values to display. */
    pictureUrl;
    name;
    price;

    handleClick() {
        const selectedEvent = new CustomEvent('productselected', {
            detail: this.product.Id
        });
        this.dispatchEvent(selectedEvent);
    }
}