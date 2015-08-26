(function() {
  'use strict';

  angular
    .module('client')
    .directive('acmePlayers', acmePlayers);

  /** @ngInject */
  function acmePlayers() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/players/players.html',
      scope: {
          creationDate: '='
      },
      controller: PlayersController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function PlayersController(socket) {
      var vm = this;

      // "vm.creation" is avaible by directive option "bindToController: true"
      vm.relativeDate = moment(vm.creationDate).fromNow();
    }
  }

})();
