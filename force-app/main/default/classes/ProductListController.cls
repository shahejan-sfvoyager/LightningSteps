public with sharing class ProductListController {
    public class Filters {
        @AuraEnabled
        public String searchKey { get; set; }
        @AuraEnabled
        public Decimal maxPrice { get; set; }
        @AuraEnabled
        public String[] families { get; set; }
        @AuraEnabled
        public String[] materials { get; set; }
        @AuraEnabled
        public String[] sizes { get; set; }
    }

    @AuraEnabled(Cacheable=true)
    public static Map<String,Object> getProducts(Filters filters) {
        String key, whereClause = '';
        Decimal maxPrice;
        String[] families, materials, sizes, criteria = new List<String>{};
        if (filters != null) {
            maxPrice = filters.maxPrice;
            materials = filters.materials;
            sizes = filters.sizes;
            if (!String.isEmpty(filters.searchKey)) {
                key = '%' + filters.searchKey + '%';
                criteria.add('Name LIKE :key');
            }
            if (filters.maxPrice >= 0) {
                maxPrice = filters.maxPrice;
                criteria.add('Price__c <= :maxPrice');
            }
            if (filters.families != null) {
                families = filters.families;
                criteria.add('Family IN :families');
            }
            if (filters.sizes != null) {
                sizes = filters.sizes;
                criteria.add('Size_UK_India__c IN :sizes');
            }
            if (filters.materials != null) {
                materials = filters.materials;
                criteria.add('Material__c IN :materials');
            }
            if (criteria.size() > 0) {
                whereClause = 'WHERE ' + String.join(criteria, ' AND ');
            }
        }
        Map<String,Object> response=new Map<String,Object>();
        List<Product2> listProduct = Database.query(
            'SELECT Id, Name, Price__c, Size_UK_India__c, Family, Material__c, DisplayUrl FROM Product2 '+
            whereClause
        );
        if(listProduct!=null)
            response.put('listOfProduct',(object)listProduct);
        return response;
    }

}
