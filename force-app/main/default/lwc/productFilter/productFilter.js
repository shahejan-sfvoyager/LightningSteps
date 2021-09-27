import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Product schema
import ProductObject from '@salesforce/schema/Product2';
import SIZE_FIELD from '@salesforce/schema/Product2.Size_UK_India__c';
import FAMILY_FIELD from '@salesforce/schema/Product2.Family';
import MATERIAL_FIELD from '@salesforce/schema/Product2.Material__c';

// Lightning Message Service and a message channel
import { publish, MessageContext } from 'lightning/messageService';
import PRODUCTS_FILTERED_MESSAGECHANNEL from '@salesforce/messageChannel/ProductsFiltered__c';

// The delay used when debouncing event handlers before firing the event
const DELAY = 350;

/**
 * Displays a filter panel to search for Product__c[].
 */
export default class ProductFilter extends LightningElement {
    filterOpen=false;
    searchKey = '';
    maxPrice = 1000;

    filters = {
        searchKey: '',
        maxPrice: 1000
    };

    @wire(MessageContext)
    messageContext;

    // GET OBJECT INFO
    @wire (getObjectInfo, {objectApiName: ProductObject})
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: FAMILY_FIELD
    })
    families;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: SIZE_FIELD
    })
    sizes;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: MATERIAL_FIELD
    })
    materials;

    handleSearchKeyChange(event) {
        this.filters.searchKey = event.target.value;
        this.delayedFireFilterChangeEvent();
    }

    handleMaxPriceChange(event) {
        const maxPrice = event.target.value;
        this.filters.maxPrice = maxPrice;
        this.delayedFireFilterChangeEvent();
    }

    handleCheckboxChange(event) {
        if (!this.filters.families) {
            // Lazy initialize filters with all values initially set
            this.filters.families = this.families.data.values.map(
                (item) => item.value
            );
            this.filters.sizes = this.sizes.data.values.map(
                (item) => item.value
            );
            this.filters.materials = this.materials.data.values.map(
                (item) => item.value
            );
        }
        const value = event.target.dataset.value;
        const filterArray = this.filters[event.target.dataset.filter];
        if (event.target.checked) {
            if (!filterArray.includes(value)) {
                filterArray.push(value);
            }
        } else {
            this.filters[event.target.dataset.filter] = filterArray.filter(
                (item) => item !== value
            );
        }
        // Published ProductsFiltered message
        publish(this.messageContext, PRODUCTS_FILTERED_MESSAGECHANNEL, {
            filters: this.filters
        });
    }

    delayedFireFilterChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            // Published ProductsFiltered message
            publish(this.messageContext, PRODUCTS_FILTERED_MESSAGECHANNEL, {
                filters: this.filters
            });
        }, DELAY);
    }

    handleFilterSection() {
        this.filterOpen = !this.filterOpen;
    }
}
