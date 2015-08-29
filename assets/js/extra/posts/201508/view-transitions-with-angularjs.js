// view-transitions-with-angular.js

;(function(){
    angular
        .module("morin", ["ngAnimate"])
        .controller("viewController", viewController);

    function viewController(){
        var view = this,
        nameArray = ["haru", "natsu", "aki", "fuyu"],
        indexCurrent = 0;

        view.next = next;
        view.current = nameArray[indexCurrent];

        function next(){
            indexCurrent = (indexCurrent + 1) % nameArray.length;
            view.current = nameArray[indexCurrent];
        }
    }
}());