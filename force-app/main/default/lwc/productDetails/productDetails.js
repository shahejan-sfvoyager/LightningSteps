import { LightningElement, api, wire } from 'lwc';

// Utils to extract field values
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Lightning Message Service and a message channel
import { NavigationMixin } from 'lightning/navigation';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import PRODUCTSELECTED_MESSAGECHANNEL from '@salesforce/messageChannel/ProductSelected__c';
import CARTOPENED_MESSAGECHANNEL from '@salesforce/messageChannel/ProductCartOpened__c';

import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import NAME_FIELD from '@salesforce/schema/Product2.Name';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';
import SIZE_FIELD from '@salesforce/schema/Product2.Size_UK_India__c';
import MATERIAL_FIELD from '@salesforce/schema/Product2.Material__c';
import PRICE_FIELD from '@salesforce/schema/Product2.Price__c';
import FAMILY_FIELD from '@salesforce/schema/Product2.Family';
import DESCRIPTION_FIELD from '@salesforce/schema/Product2.Description';

import USERID from '@salesforce/user/Id';
import ISPORTALUSER_FIELD from '@salesforce/schema/User.IsPortalEnabled';

/** Static Resources. */
import LOGO_ASSETS_URL from '@salesforce/resourceUrl/LightningSteps_Logo';

/* Apex Method */
import addProductToCart from '@salesforce/apex/OrderController.addProductToOrder';

export default class ProductDetails extends NavigationMixin(LightningElement) {
    // Expose a field to make it available in the template    
    productSize=SIZE_FIELD;
    productMaterial=MATERIAL_FIELD;
    productPrice=PRICE_FIELD;
    productDescription=DESCRIPTION_FIELD;

    // Flexipage provides recordId
    @api recordId;
    orderId;
    orderItem;
    orderError;

    productName;
    productPictureUrl;
    productFamily;

    /** Url for bike logo. */
    logoUrl = LOGO_ASSETS_URL;

    @wire(getRecord, {
        recordId: USERID,
        fields: [ISPORTALUSER_FIELD]
    }) 
    user;

    /** Load context for Lightning Messaging Service */
    @wire(MessageContext) messageContext;

    /** Subscription for ProductSelected Lightning message */
    productSelectionSubscription;
    connectedCallback() {
        // Subscribe to ProductSelected message
        this.productSelectionSubscription = subscribe(
            this.messageContext,
            PRODUCTSELECTED_MESSAGECHANNEL,
            (message) => this.handleProductSelected(message.productId)
        );
    }

    /**
     * Handler for when a product is selected. When `this.recordId` changes, the
     * lightning-record-view-form component will detect the change and provision new data.
     */
     handleProductSelected(productId) {
        this.recordId = productId;
        this.orderItem = null;
    }

    handleRecordLoaded(event) {
        const { records } = event.detail;
        const recordData = records[this.recordId];
        this.productName = getFieldValue(recordData, NAME_FIELD);
        this.productPictureUrl = getFieldValue(recordData, DISPLAYURL_FIELD);
        this.productFamily = getFieldValue(recordData, FAMILY_FIELD);
    }

    handleNavigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: PRODUCT_OBJECT.objectApiName,
                actionName: 'view'
            }
        });
    }

    handleAddToCart(){
        addProductToCart({productId : this.recordId})
            .then(result => {
                this.orderId = result.orderId;
                this.orderItem=result.orderItemDetails;
            })
            .catch(error => {
                this.orderError = error;
            });
    }

    handleOpenCart(){
        if(this.user.data && this.user.data.fields.IsPortalEnabled.value){
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    pageName: 'cart'
                },
            });
        }
        else{
            // Published ProductCartOpened message
            publish(this.messageContext, CARTOPENED_MESSAGECHANNEL, {
                orderId: this.orderId
            });            
        }
    }

}