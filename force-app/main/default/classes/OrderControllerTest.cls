@isTest
public with sharing class OrderControllerTest {
    @testSetup
    static void setup() {
        Account acc = new Account(Name = 'LightningSteps Global (Do Not Edit)');
        insert acc;
        Pricebook2 priceBookStnd =new Pricebook2(Name='Standard',IsActive=true);
        insert priceBookStnd;
        Product2 p = new Product2(Name = 'Sample Product');
        insert p;
        insert new PriceBookEntry(Product2Id=p.Id, Pricebook2Id=Test.getStandardPricebookId(), UnitPrice=0);
        PricebookEntry pbEnty=new PricebookEntry(Pricebook2Id=priceBookStnd.Id,Product2Id=p.Id,UnitPrice=10);
        insert pbEnty;
    }

    @isTest
    static void testGetOrderItems() {
        Product2 testOrder = [SELECT Id FROM Product2];
        Map<String,Object> response = OrderController.addProductToOrder(
            testOrder.Id
        );
        System.assert(response!=null);
    }
}
