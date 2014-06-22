APP_KEY = "f417e2ff0264769fc557b116fb4197d0";
APP_ID = "b1229d17";

if (Meteor.isClient) {
  // Meteor.subscribe('user-ingredients');

  Template.input.greeting = function () {
    return "munchies.";
  };

  // Template.input.foodItems = function () {
  //   return Ingredients.find();
  // }

  Template.ingr.foodItems = [];

  Template.input.events({
    'keyup #ingredient_box': function () {
      if (event.keyCode == 13) {
        var ingr = event.target.value;
        if (ingr) {
          Template.ingr.foodItems.push({'name': ingr})
          event.target.value = "";
          var node = document.getElementById("food-items");   
          node.innerHTML ="";
          var temp = UI.render(Template.ingr);
          UI.insert(temp, node);
        }
      }
    },
    'click #submit': function () {
      Meteor.call('getRecipe', Template.ingr.foodItems, function(error, response) {

      });
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //if (Ingredients.find().count() === 0) {
    //}
  });



  Meteor.methods({
    // addIngredient: function (ingredient, userId) {
    //   Ingredients.insert({name: ingredient, user_id: userId});
    // },

    getRecipe: function (ingredients) {


      var params = {
        '_app_key': APP_KEY,
        '_app_id': APP_ID,
        'allowedIngredient[]': "cognac"
      };

      //url_call = url + "?app_key=" + _app_key + "&_app_id=" + _app_id + "&allowedIngredient[]=cognac";

      // Do call here, return value with Future
      this.unblock();
      try {
        //var result = HTTP.call("GET", "http://api.yummly.com/v1/api/recipes", {params: params});
        var result = HTTP.get("http://api.yummly.com/v1/api/recipes" + "?_app_key=" + params._app_key + "&_app_id=" + params._app_id + "&allowedIngredient[]=cognac");  
        // var result = "http://api.yummly.com/v1/api/recipes?_app_key=f417e2ff0264769fc557b116fb4197d0&_app_id=b1229d17&allowedIngredient[]=cognac";
        console.log(result);
        //result = 'test'
        return result;
      } catch (e) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }
    }
  });
}
