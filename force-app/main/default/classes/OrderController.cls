/**
 * @description This class is used for Order releated aaura methods of LWC
 * @author Shahejan
 * @date 2021-09-25
 */
public without sharing class OrderController {
    /**
     * @description This mehod to create draft order and add product as order line item
     * @param productId Id of product
     */
    @AuraEnabled
    public static Map<String,Object> addProductToOrder(String productId) {
        Map<String,Object> response=new Map<String,Object>();
        Contact conRec=fetchContact();
        if(conRec!=null){
            Order darftOrder=fetchOrderDetails(conRec.Id);
            OrderItem newItem;
            if(darftOrder!=null){
                response.put('orderId',darftOrder.Id);
                if(darftOrder.OrderItems!=null){
                    for(OrderItem item:darftOrder.OrderItems){
                        if(item.Product2Id==productId){
                            newItem=item;
                            break;
                        }
                    }
                }
                if(newItem==null){
                    newItem=createOrderItem(productId,darftOrder.Id);                    
                    insert newItem;                    
                }
            }
            else{
                Order newOrder=createOrder(conRec);
                insert newOrder;
                response.put('orderId',newOrder.Id);
                newItem=createOrderItem(productId,newOrder.Id);                    
                insert newItem;                
            }
            response.put('orderItemDetails',(object)newItem);
        }
        return response;
    }

     /**
     * @description This mehod to get draft order and related product order line items for cart display
     * @param NA
     */
    @AuraEnabled
    public static Map<String,Object> fetchCartDetails() {
        Map<String,Object> response=new Map<String,Object>();
        Contact conRec=fetchContact();
        if(conRec!=null){
            response.put('contactDetails',(object)conRec);
            Order orderDetails=fetchOrderDetails(conRec.Id);
            response.put('orderDetails',(object)orderDetails);
        }
        return response;
    }

    /**
     * @description This mehod to update draft order related product order line items quantity
     * @param orderItemRec
     */
    @AuraEnabled
    public static Map<String,Object> updateItemQuantity(OrderItem orderItemRec) {
        if(orderItemRec!=null){
            if(orderItemRec.Quantity<1)
                delete orderItemRec;
            else
                update orderItemRec;            
        }           
        return fetchCartDetails();    
    }

    /**
     * @description This mehod to update draft order stataus
     * @param orderId
     */
    @AuraEnabled
    public static Map<String,Object> updateOrderStatus(String orderId) {
        if(orderId!=null){
            List<Order> listOrder=[Select Id,Status From Order where id=:orderId];
            listOrder[0].Status='Activated';
            update listOrder;
        }
        return fetchCartDetails();    
    }

    private static Contact fetchContact(){
        Contact conDetails;
        User userDetails=[Select id,Name,FirstName,LastName,Title,Email,UserType,ContactId,Address,City,Street,State,PostalCode,Country From User where id=:UserInfo.getUserId()];
        if(UserInfo.getUserType()=='Standard'){
            List<Contact> listCon=[SELECT AccountId,Email,Title,FirstName,Id,LastName,MailingAddress,MailingStreet,MailingCity,MailingState,MailingPostalCode,MailingCountry,Name,Type__c 
                                    FROM Contact where email = :UserInfo.getUserEmail()];
            if((listCon==null || listCon.isEmpty())){
                List<Account> listAcc=[Select Id,Name from Account Where Name = 'LightningSteps Global (Do Not Edit)'];
                conDetails=new Contact(FirstName=userDetails.FirstName,LastName=userDetails.LastName,Title=userDetails.Title,Email=userDetails.Email,
                                        MailingStreet=userDetails.Street,MailingCity=userDetails.City,MailingState=userDetails.State,MailingPostalCode=userDetails.PostalCode,MailingCountry=userDetails.Country,
                                        Type__c='Internal',
                                        AccountId=listAcc[0].Id);
                insert conDetails;                
            }
            else{
                conDetails=listCon[0];
            }
        }
        else if(userDetails!=null && userDetails.contactId!=null){
            List<Contact> listExtCon=[SELECT AccountId,Email,FirstName,Id,LastName,MailingAddress,MailingStreet,MailingCity,MailingState,MailingPostalCode,MailingCountry,Name,Type__c 
                                    FROM Contact where Id = :userDetails.contactId];
            if(listExtCon!=null && !listExtCon.isEmpty())
                conDetails=listExtCon[0];
        }
        return conDetails;
    }

    private static Order fetchOrderDetails(String ContactId){
        List<Order> listOrders=[SELECT AccountId,BillingAddress,BillingCity,BillingCountry,BillingGeocodeAccuracy,BillingLatitude,BillingLongitude,BillingPostalCode,BillingState,BillingStreet,BillToContactId,
                                Description,EffectiveDate,EndDate,Id,IsDeleted,IsReductionOrder,Name,
                                OrderNumber,OrderReferenceNumber,Pricebook2Id,
                                ShippingAddress,ShippingCity,ShippingCountry,ShippingGeocodeAccuracy,ShippingLatitude,ShippingLongitude,ShippingPostalCode,ShippingState,ShippingStreet,
                                ShipToContactId,Status,StatusCode,SystemModstamp,TotalAmount,Type,
                                (Select id,Description,ListPrice,PriceBookEntryId,Product2Id,Product2.Name,Quantity,TotalPrice,UnitPrice from OrderItems)
                                FROM Order 
                                Where ShipToContactId=:ContactId AND Status='Draft'];
        if(listOrders!=null && !listOrders.isEmpty())
            return listOrders[0];
        return null;
    }

    private static Order createOrder(Contact contactDetails){
        Pricebook2 priceBookStnd=[SELECT Id,Name FROM Pricebook2 Where Name='Standard'];
        Order orderDetails=new Order(
            AccountId=contactDetails.AccountId,
            BillingCity=contactDetails.MailingCity,
            BillingCountry=contactDetails.MailingCountry,
            BillingStreet=contactDetails.MailingStreet,
            BillingState=contactDetails.MailingState,
            BillingPostalCode=contactDetails.MailingPostalCode,
            ShippingCity=contactDetails.MailingCity,
            ShippingCountry=contactDetails.MailingCountry,
            ShippingStreet=contactDetails.MailingStreet,
            ShippingState=contactDetails.MailingState,
            ShippingPostalCode=contactDetails.MailingPostalCode,
            ShipToContactId=contactDetails.Id,
            Status='Draft',
            EffectiveDate=System.today(),
            Pricebook2Id=priceBookStnd.Id
        );
        return orderDetails;
    }

    private static OrderItem createOrderItem(String productId, String orderId){
        List<PricebookEntry> listPEntry=[SELECT Id,Name,Pricebook2Id,Pricebook2.Name,Product2Id,UnitPrice  
                                                    FROM PricebookEntry where Pricebook2.Name='Standard' AND Product2Id=:productId];
        OrderItem newItem=new OrderItem(Product2Id=productId,
        Quantity=1,
        orderId=orderId,
        PriceBookEntryId=listPEntry[0].Id,
        UnitPrice=listPEntry[0].UnitPrice);
        return newItem;
    }
}
