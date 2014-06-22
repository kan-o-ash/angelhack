

if (Meteor.isClient) {
  // Meteor.subscribe('user-ingredients');
  Meteor.startup(function () {
    Session.set('search_ready', false)
    Session.set('recip_ready', false)
  })

  Template.main.helpers({
    greeting: function () { // The top greeting of site
      return "munchies.";
    },
    searchReady: function () { // Is the search ready to display?
      return Session.get('search_ready');
    },
    recipeReady: function () { // Is the search ready to display?
      return Session.get('recipe_ready');
    },
    addIngredient: function (field) {

      //The ingredient enterred
      var ingr = field.value;

      // If already in the list, don't bother with it
      if (Template.ingr.foodItems.indexOf(ingr) !== -1 ) {
        field.value = "";
      }
      // If new, valid ingredient
      else if (ingr) {
        Template.ingr.foodItems.push(ingr)
        field.value = "";
        var node = $("#food_items");
        node[0].innerHTML = "";
        var temp = UI.render(Template.ingr);
        UI.insert(temp, node[0]);
      }
    }
  });

  Template.main.events({
    'keyup #ingredient_box': function () {
      if (event.keyCode === 13) {
        Template.main.addIngredient($(event.target)[0]);
      }
    },
    'click #add_ingredient':  function () {
      var field = $('#ingredient_box')[0]
      field.focus();
      Template.main.addIngredient(field);
    },
    'click #submit_btn': function () { // Clicking submit to get recipes
      if(Template.ingr.foodItems.length) {
        Meteor.call('getRecipe', Template.ingr.foodItems, function(error, response) {
          if (response) {
            Session.set('search_results', response); // Dictionary of recipes
            Session.set('search_ready', true);      // Makes search results display
            console.log(response);
          }
          else {
            console.log(error);
            console.log(2);
          }
        });
      }
    },
    'click #back_btn': function () {
      if (Session.get('search_ready')) {
        Session.set('search_ready', false);      // Makes search results display      
        Session.set('recipe_ready', false);
      }
      else if (Session.get('recipe_ready')) {
        Session.set('search_ready', true);      // Makes search results display      
        Session.set('recipe_ready', false);
      }
    },
    'click #home_btn': function () {
      location.reload();
    }
  });

  Template.ingr.helpers({
    foodItems: []
  });
  
  Template.searchResults.helpers({
    results: function () {
      return Session.get("search_results");
    }
  });
  Template.searchResults.events({
    'click .item': function () {
      console.log(event);
      $item = $(event.target);
      var id = $item.attr('arrayID');
      var recipes = Session.get('search_results');
      Session.set('recipe_item', recipes[id]);
      Session.set('recipe_ready', true);
      Session.set('search_ready', false);
    }
  });
  Template.recipeInfo.helpers({
    recipeItem: function () {
      return Session.get('recipe_item');
    }
  })
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    //if (Ingredients.find().count() === 0) {
    //}
    APP_KEY = "f417e2ff0264769fc557b116fb4197d0";
    APP_ID = "b1229d17";
    BASE_URL = "http://api.yummly.com/v1/api/recipes";
    ingredient_arg = "allowedIngredient[]";
    // if (!sample) {
      // sample = HTTP.get("http://api.yummly.com/v1/api/recipes?_app_key=f417e2ff0264769fc557b116fb4197d0&_app_id=b1229d17&allowedIngredient[]=cognac").content;
    // }
  });

  Meteor.methods({
    // addIngredient: function (ingredient, userId) {
    //   Ingredients.insert({name: ingredient, user_id: userId});
    // },
    buildURL: function (ingredients) {
      url = BASE_URL + "?";
      for (var i=0; i<ingredients.length; i++) {
        if (i !== 0) {
          url += "&";
        }
        url += ingredient_arg + "=" + ingredients[i] 
      }
      return url;
    },
    getRecipe: function (ingredients) {
      var params = {
        '_app_key': APP_KEY,
        '_app_id': APP_ID,
        'maxResult': 16,
        'requirePictures': true
      };

      //url_call = url + "?app_key=" + _app_key + "&_app_id=" + _app_id + "&allowedIngredient[]=cognac";

      url = Meteor.call('buildURL', ingredients);

      // Do call here, return value with Future
      this.unblock();
      try {
        var results = HTTP.call("GET", url, {params: params});
        
        var recipes = JSON.parse(results.content).matches;

        var new_rep = [];
        for (var i=0; i<recipes.length;i++){
          values = {
            'name': recipes[i].recipeName,
            'src': recipes[i].smallImageUrls[0],
            'ingredients': recipes[i].ingredients,
            'timeTaken': recipes[i].totalTimeInSeconds,
            'ind': i
          }
          new_rep.push(values);
        }
        return new_rep;
      } catch (e) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }
    }
  });
}
