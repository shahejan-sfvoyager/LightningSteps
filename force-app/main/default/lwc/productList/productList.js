import { LightningElement,wire } from 'lwc';
// Lightning Message Service and message channels
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import PRODUCTSELECTED_MESSAGECHANNEL from '@salesforce/messageChannel/ProductSelected__c';
import PRODUCTS_FILTERED_MESSAGECHANNEL from '@salesforce/messageChannel/ProductsFiltered__c';

// getProducts() method in ProductListController Apex class
import getProducts from '@salesforce/apex/ProductListController.getProducts';

export default class ProductList extends LightningElement {

    /** JSON.stringified version of filters to pass to apex */
    filters = {};

    /**
     * Load the list of available products.
     */
    @wire(getProducts, {filters: '$filters'} )
    products;

    connectedCallback() {
        // Subscribe to ProductsFiltered message
        this.productFilterSubscription = subscribe(
            this.messageContext,
            PRODUCTS_FILTERED_MESSAGECHANNEL,
            (message) => this.handleFilterChange(message)
        );
    }

    handleFilterChange(message) {
        this.filters = { ...message.filters };
    }

     /** Load context for Lightning Messaging Service */
    @wire(MessageContext) messageContext;

     //Custom Event Handler from child components
     handleProductSelected(event) {
        // Published ProductSelected message
        publish(this.messageContext, PRODUCTSELECTED_MESSAGECHANNEL, {
            productId: event.detail
        });
    }
}