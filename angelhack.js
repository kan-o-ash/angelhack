Ingredients = new Meteor.Collection("ingredients");

if (Meteor.isClient) {
  Meteor.subscribe('user-ingredients');

  Template.input.greeting = function () {
    return "munchies.";
  };

  // Template.input.foodItems = function () {
  //   return Ingredients.find();
  // }

  Template.ingr.foodItems = [{"name":''}]

  Template.input.events({
    'keydown input': function () {
      console.log(event);
      if (event.keyCode == 13) {
        // Meteor.call('addIngredient', event.target.value, Meteor.default_connection._lastSessionId);
        Template.ingr.foodItems.push({'name': event.target.value})
        event.target.value = "";
        var node = document.getElementById("food-items");
        node.innerHTML ="";
        var temp = UI.render(Template.ingr);
        UI.insert(temp, node);
      }
    },
    'click #input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined') {
        console.log("You pressed the button");
        Meteor.call('getRecipe', function(err,response) {
          if(err) {
            Session.set('serverDataResponse', "Error:" + err.reason);
            return;
          }
          Session.set('serverDataResponse', response);
          console.log(response);
        });
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Ingredients.find().count() === 0) {
    }
  });

  Meteor.publish('user-ingredients'), function publishFunction() {
    return Ingredients.find({author: this.userId}, {sort: {date: -1}, limit: 10});
  }

  Meteor.methods({
    addIngredient: function (ingredient, userId) {
      Ingredients.insert({name: ingredient, user_id: userId});
    },
    getRecipe: function () {
      var params = {
        '_app_key': "f417e2ff0264769fc557b116fb4197d0",
        '_app_id': "b1229d17",
        'allowedIngredient[]': "cognac"
      };

      //url_call = url + "?app_key=" + _app_key + "&_app_id=" + _app_id + "&allowedIngredient[]=cognac";
      console.log(params);
        result = 'test'

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
