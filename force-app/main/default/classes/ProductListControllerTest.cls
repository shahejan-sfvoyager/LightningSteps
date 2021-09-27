/**
 * @description This test class is used for to cover ProductListController methhods
 * @author Shahejan
 * @date 2021-09-25
 */
@isTest
public with sharing class ProductListControllerTest {
    @testSetup
    static void createProducts() {
        List<Product2> products = new List<Product2>();

        products.add(
            new Product2(
                Name = 'Sample Bike 1',
                Price__c = 1000,
                Family = 'Sports Shoes',
                Size_UK_India__c = '8',
                Material__c = 'Synthetic'
            )
        );

        products.add(
            new Product2(
                Name = 'Sample Bike 2',
                Price__c = 1000,
                Family = 'Sports Shoes',
                Size_UK_India__c = '8',
                Material__c = 'Synthetic'
            )
        );

        insert products;
    }

    @isTest
    static void testGetProducts() {
        ProductListController.Filters filters = new ProductListController.Filters();
        filters.searchKey = 'Sample';
        filters.maxPrice = 2000;
        filters.families = new List<String>{ 'Sports Shoes' };
        filters.sizes = new List<String>{ '8' };
        filters.materials = new List<String>{ 'Synthetic' };
        Map<String,Object> result = ProductListController.getProducts(filters);
        System.assert(result.get('listOfProduct')!=null);
    }
}
