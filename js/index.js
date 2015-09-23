var app = angular.module('twitchApp', []);

app.controller('twitchController', ['$scope', '$http', function($scope, $http) {
  var prefix = 'https://api.twitch.tv/kraken/';
  var str = 'streams/';
  var usr = 'users/';
  var callback = '?callback=JSON_CALLBACK'; //to avoid same origin error
  $scope.all = [];
  $scope.online = [];
  $scope.offline = [];
  $scope.activeList = $scope.all; //default to all, change with buttons
  $scope.streamers = ["freecodecamp", "storbeck", "terakilobyte", "habathcx", "robotcaleb", "comster404", "brunofin", "thomasballinger", "noobs2ninjas", "beohoff", "medrybw", ]; //keep lowercase for existing user check when adding streamers
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

  function removeActive() {
    $('#onlineStatus button').removeClass('active');
  }
  $scope.listAll = function() {
    removeActive();
    $('#allButton').addClass('active')
    $scope.activeList = $scope.all;
  }
  $scope.listOn = function() {
    removeActive();
    $('#onButton').addClass('active')
    $scope.activeList = $scope.online;
  }
  $scope.listOff = function() {
    removeActive();
    $('#offButton').addClass('active')
    $scope.activeList = $scope.offline;
  }

  function newStreamer(stream) {
    var channel = {};
    $http.jsonp(prefix + str + stream + callback)
      .success(function(data) {
        channel.link = 'http://twitch.tv/' + stream;
        if (data.stream !== null) {
          channel.name = data.stream.channel.display_name;
          channel.game = data.stream.channel.game;
          if (data.logo !== null) {
            channel.image = data.stream.channel.logo;
          } else {
            channel.image = 'http://placehold.it/100x100'
          }
          channel.status = data.stream.channel.status.substr(0, 40) + '...';
          //console.log(channel.name, channel.game, channel.image, channel.status);
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
              //console.log(channel.name, channel.game, channel.image, channel.status);
            });
        }
        $scope.all.push(channel);
        //console.log("pushing: " + channel);
        if (data.stream === null) {
          $scope.offline.push(channel);
        } else {
          $scope.online.push(channel);
        }
      })
  }
  $scope.streamers.forEach(function(stream) {
    newStreamer(stream);
  });

  $('#addButton').click(function() {
    var stream = document.getElementById('addInput').value.toLowerCase();
    if ($scope.streamers.indexOf(stream) === -1) {
      newStreamer(stream);
      $scope.streamers.push(stream);
    } else {
      $('#addError').text('User already exists!').show();
      $('#addError').fadeOut(1000);
    }
  });

}]);