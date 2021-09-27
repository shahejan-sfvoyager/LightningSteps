({
    handleCartUtility : function(component, event, helper) {
        var utilityAPI = component.find("utilitybar");
        utilityAPI.getAllUtilityInfo().then(function(response) {
            var myUtilityInfo = response[0];
            utilityAPI.openUtility({
                utilityId: myUtilityInfo.id
            });
            component.find("lwcCart").handleCartLoad();
       }).catch(function(error) {
            console.log(error);
        });
    }
})
