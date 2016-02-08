var app = angular.module('twitchApp', []);

app.controller('twitchController', ['$scope', '$http', function($scope, $http) {
  //variables for API call
  var prefix = 'https://api.twitch.tv/kraken/';
  var str = 'streams/';
  var usr = 'users/';
  var callback = '?callback=JSON_CALLBACK'; //to avoid same origin error
  
  //creating arrays for each online status and variable for list currently being displayed
  $scope.all = [];
  $scope.online = [];
  $scope.offline = [];
  $scope.activeList = $scope.all; //default to all, change with buttons
  
  //default streamers
  $scope.streamers = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "robotcaleb", "comster404", "brunofin", "thomasballinger", "noobs2ninjas", "beohoff", "medrybw", ]; //keep lowercase for existing user check when adding streamers
  
  //add a streamer to the list
  $scope.addStreamer = function(stream) {
    var channel = {};
    
    //for users that are currently streaming, use the stream API
    $http.jsonp(prefix + str + stream + callback)
      .success(function(data) {
        
        //get link to streamer URL
        channel.link = 'http://twitch.tv/' + stream;
        
        if (data.stream !== null) {
          channel.name = data.stream.channel.display_name;
          channel.game = data.stream.channel.game;
          
          //get user logo, if no logo, replace with gray placeholder image
          if (data.logo !== null) {
            channel.image = data.stream.channel.logo;
          } else {
            channel.image = 'http://placehold.it/100x100'
          }
          
          channel.status = data.stream.channel.status.substr(0, 40) + '...';
          
          //for users that are offline/not currently streaming, use the user API
        } else {
          $http.jsonp(prefix + usr + stream + callback) //if user is not streaming, get data by user
            .success(function(data) {
              channel.name = data.display_name;
              channel.game = "Offline";
              
              if (data.logo !== null) {
                channel.image = data.logo;
              } else {
                channel.image = 'http://placehold.it/150x150'
              }
              channel.status = "Not streaming";
            });
        }
        
        //sort streamer into online/offline
        $scope.all.push(channel);
        if (data.stream === null) {
          $scope.offline.push(channel);
        } else {
          $scope.online.push(channel);
        }
      })
  }
  
  //remove a streamer from the list
  $scope.delete = function(channel) {
    var idxAll = $scope.all.indexOf(channel);
    var idxOnline = $scope.online.indexOf(channel);
    var idxOffline = $scope.offline.indexOf(channel);
    if (confirm('Are you sure you want to remove this streamer?') === true) {
      $scope.all.splice(idxAll, 1);
      if (idxOnline !== -1) {
        $scope.online.splice(idxOnline, 1);
      }
      if (idxOffline !== -1) {
        $scope.offline.splice(idxOffline, 1);
      }
    }
  };
  
  //populate list with default streamers
  $scope.streamers.forEach(function(stream) {
    $scope.addStreamer(stream);
  });
  
  // All/Online/Offline button functionality
  $scope.removeActive = function() {
    $('#onlineStatus button').removeClass('active');
  }
  $scope.changeList = function(list){
    console.log("changelist is passed: "+ list);
    switch(list){
      case "all": $scope.activeList = $scope.all;
        break;
      case "online": $scope.activeList = $scope.online;
        break;
      case "offline": $scope.activeList = $scope.offline;
        break;
      default: $scope.activeList = $scope.all;
        break;
    }
  }
  $scope.listBy = function(list) {
    $scope.removeActive();
    $("#"+list+"Button").addClass('active');
    $scope.changeList(list);
  }

  //functionality for the add streamer box
  $('#addButton').click(function() {
    var stream = document.getElementById('addInput').value.toLowerCase();
    if ($scope.streamers.indexOf(stream) === -1) {
      $scope.addStreamer(stream);
      $scope.streamers.push(stream);
    } else {
      $('#addError').text('User already exists!').show();
      $('#addError').fadeOut(1000);
    }
  });

}]);
