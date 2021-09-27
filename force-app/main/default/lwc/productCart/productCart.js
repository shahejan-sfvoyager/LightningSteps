import { LightningElement, api } from 'lwc';
import ORDER_OBJECT from '@salesforce/schema/Order';
import { NavigationMixin } from 'lightning/navigation';

/* Apex Method */
import getCartDetails from '@salesforce/apex/OrderController.fetchCartDetails';
import updateCartItemQuantity from '@salesforce/apex/OrderController.updateItemQuantity';
import placeOrder from '@salesforce/apex/OrderController.updateOrderStatus';

export default class ProductCart extends NavigationMixin(LightningElement) {
    contact;
    orderId;
    order;
    orderItems;
    orderError;
    connectedCallback() {
        this.handleCartLoad();
    }
    @api
    handleCartLoad(){
        getCartDetails()
            .then(result => {
                this.contact = result.contactDetails;
                this.order=result.orderDetails;
                if(result.orderDetails)
                    this.orderItems=result.orderDetails.OrderItems;
                else
                    this.orderItems=null;
            })
            .catch(error => {
                this.orderError = error;
            });
    }

    handleItemAdd(event){
        const selectedItemId = event.target.name;
        for(let itemNo in this.orderItems){
            if(selectedItemId===this.orderItems[itemNo].Id){
                this.orderItems[itemNo].Quantity=this.orderItems[itemNo].Quantity+1;
                this.handleCartItemQuantity(this.orderItems[itemNo]);
                break;
            }

        }
    }

    handleItemRemove(event){
        const selectedItemId = event.target.name;
        for(let itemNo in this.orderItems){
            if(selectedItemId===this.orderItems[itemNo].Id){
                this.orderItems[itemNo].Quantity=this.orderItems[itemNo].Quantity-1;
                this.handleCartItemQuantity(this.orderItems[itemNo]);
                break;
            }

        }
    }

    handleCartItemQuantity(item){
        updateCartItemQuantity({orderItemRec : item})
            .then(result => {
                this.contact = result.contactDetails;
                this.order=result.orderDetails;
                if(result.orderDetails)
                    this.orderItems=result.orderDetails.OrderItems;
                else
                    this.orderItems=null;
            })
            .catch(error => {
                this.orderError = error;
            });
    }

    handlePlaceOrder(){
        this.orderId=this.order.Id;
        placeOrder({orderId : this.orderId})
            .then(result => {
                this.handleNavigateToRecord(this.orderId);
                this.order=result.orderDetails;
                if(result.orderDetails)
                    this.orderItems=result.orderDetails.OrderItems;
                else
                    this.orderItems=null;
            })
            .catch(error => {
                this.orderError = error;
            });
    }

    handleNavigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: ORDER_OBJECT.objectApiName,
                actionName: 'view'
            }
        });
    }
}