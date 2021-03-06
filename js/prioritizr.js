(function() {
  var app = angular.module('prioritizr', ['ngDragDrop', 'ui.sortable', 'LocalStorageModule']);
  
  app.config(function(localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('pr')
      .setStorageCookie(0)
      .setStorageCookieDomain('');
  });

  app.factory('Item', function() {
    var currItemId = 0;
    var nextItemId = function() {
      currItemId += 1;
      return currItemId;
    };
        
    var Item = function(body) {
      this.id = null;
      this.body = "";
          
      this.edit = function(newBody) {
        this.body = newBody;
      };
      
      this.initialize = function(body) {
        this.id = nextItemId();
        this.body = body;
      };
      
      this.initialize(body);
    };
    
    return (Item);
  });
  
  
  app.factory('Quadrant', ['Item', function(Item) {
    var currQuadrantId = 0;
    var nextQuadrantId = function() {
      currQuadrantId += 1;
      return currQuadrantId;
    };
    var quadrantHeaders = [
      "URGENT",
      "NOT URGENT",
      "IMPORTANT",
      "NOT IMPORTANT"
    ]

    var Quadrant = function(rootScope) {
      this.id = null;
      this.items = [];
      this.header = "";
      this.newItem = {};
      
      this.addNewItem = function() {
        this.items.push(new Item(this.newItem.body));
        this.newItem = {};      
      };
  
      this.editItem = function(item) {
        var foundItem = $filter('filter')(this.items, {id: item.id}, true)[0];
        foundItem.body = item.body;
      };
      
      this.initialize = function() {
        this.id = nextQuadrantId();
        this.items = [new Item('Item1'),
                      new Item('Item2'),
                      new Item('Item3'),
                      new Item('Item4')];
        this.header = quadrantHeaders[(this.id-1) % 4];
      };
      
      this.initialize();
    };
    
    return (Quadrant);
  }]);

  
  app.controller('AppController', function($scope, 
                                           Quadrant,
                                           localStorageService) {
    
    this.saveState = function() {
      localStorageService.set('quadrants', JSON.stringify(this.quadrants));
    };
    
    this.fetchState = function() {
      var storedQuadrants = localStorageService.get('quadrants');
      if(storedQuadrants != null) {
        return JSON.parse(storedQuadrants); 
      } else {
        return null;
      } 
    };
    
    this.clearState = function() {
      return localStorageService.clearAll();
    };
    
    
    this.completeItem = function(quadrant, itemIdx) {
      console.log(quadrant);
      console.log(itemIdx);
      quadrant.items.splice(itemIdx, 1);
    };
    
    this.deleteItem = function(quadrant, itemIdx) {
      quadrant.items.splice(itemIdx, 1);
    };
    
    
    this.quadrants = this.fetchState() || 
          [
            new Quadrant(),
            new Quadrant(),
            new Quadrant(),
            new Quadrant()
          ];
  });
  
  app.controller('ItemController', function() {
    this.editableBody = "";
    this.readyToSave = false;

    this.enableEditor = function(item) {
      this.readyToSave = true;
      this.editableBody = item.body; 
    };
    
    this.save = function(item) {
      if(this.readyToSave === true) {
        item.body = this.editableBody;  
        this.readyToSave = false;
      }
    };
  });
  
})();