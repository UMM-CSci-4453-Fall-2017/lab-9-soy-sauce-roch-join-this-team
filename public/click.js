      angular.module('buttons',[])
        .controller('buttonCtrl',ButtonCtrl)
        .factory('buttonApi',buttonApi)
        .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

      function ButtonCtrl($scope,buttonApi){
         $scope.buttons=[]; //Initially all was still
         $scope.list=[];
         $scope.total=[];
         $scope.errorMessage='';
         $scope.logMessage='';
         $scope.deleteItem=deleteItem;
         $scope.isLoading=isLoading;
         $scope.refreshButtons=refreshButtons;
         $scope.refreshList=refreshList;
         $scope.buttonClick=buttonClick;
         $scope.voidClick=voidClick;
         $scope.loginClick=loginClick;
         $scope.logOutClick=logOutClick;
         $scope.saleButton=saleButton;
	 $scope.currentUser='';

         var loading = false;

         function isLoading(){
          return loading;
         }

         function logOutClick($event) {
           $scope.bool = false;
           $scope.logMessage = 'User logged-out';
           $scope.username = '';
           $scope.password = '';
           voidClick();
           refreshList();
         }

         function loginClick($event) {
           $scope.errorMessage='';
           buttonApi.loginCheck($scope.username, $scope.password)
              .success(function(data){
                if (data.length === 0){
                  $scope.bool = false;
                  $scope.logMessage = 'Wrong Username & Password';
                } else {
                if (data[0].CORRECT == 1){
		  $scope.currentUser = $scope.username;
                  $scope.bool = true;
                } else {
                  $scope.bool = false;
                  $scope.logMessage = 'Wrong Password';
                }
              }
              })
              .error(function(){$scope.errorMessage="Unable click";});
         }

         //When user select one of the items in the transaction table,
         //the ng-click delete-item is invoked, it calls the buttonApi.delete-item
         //and once it succeeded, the list of transaction will be refreshed.
        function deleteItem($event){
          $scope.errorMessage='';
          buttonApi.deleteItem(event.target.id)
             .success(function(){
               refreshList();
             })
             .error(function(){$scope.errorMessage="Unable click";});
        }

        //This function is repsonsible for getting the coordinates as well as
        //the name of the buttons.
        function refreshButtons(){
          loading=true;
          $scope.errorMessage='';
          buttonApi.getButtons()
            .success(function(data){
               $scope.buttons=data;
               loading=false;
            })
            .error(function () {
                $scope.errorMessage="Unable to load Buttons:  Database request failed";
                loading=false;
            });
       }

       //this function is responsible for asking the server for information regarding
       //the transaction data. Once it succeeded performing the api.getlist, it also
       //update the total amount of transaction.
       function refreshList(){
         loading=true;
         $scope.errorMessage='';
         buttonApi.getList()
           .success(function(data){
              $scope.list=data;
              getTotalAmt();
              loading=false;
           })
           .error(function () {
               $scope.errorMessage="Unable to load Buttons:  Database request failed";
               loading=false;
           });
        }

      //this function is responsible for inserting data into the database,
      //once completed, it will update the transaction data
        function buttonClick($event){
          console.log("Hello");
           $scope.errorMessage='';
           //var dt = moment(data.myTime.format('YYYY/MM/DD HH:mm:ss')).format("YYYY-MM-DD HH:mm:ss");
           buttonApi.clickButton(event.target.id, $scope.currentUser)
              .success(function(){
                refreshList();
              })
              .error(function(){$scope.errorMessage="Unable click";});
        }

        //this function is responsible for retrieving the total amount
        //of transaction in the database
        function getTotalAmt(){
          loading=true;
          $scope.errorMessage='';
          buttonApi.totalAmount()
            .success(function(data){
              $scope.amount=data[0].TOTAL;
              loading=false;
            })
            .error(function(){$scope.errorMessage="Unable to get total transaction amount";});
        }

        //this function is responsible for truncating the entire
        //transaction table.
        function voidClick($event){
          $scope.errorMessage='';
          buttonApi.voidButton()
             .success(function(){
               refreshList();
             })
             .error(function(){
               $scope.errorMessage="Unable to void this transaction";
             });
        }

        function saleButton($event) {
          $scope.errorMessage='';
          buttonApi.checkOutButton($scope.username)
             .success(function(){
               refreshList();
             })
             .error(function(){
               $scope.errorMessage="Unable to void this transaction";
             });
        }
        refreshButtons();
        refreshList();
      }

      function buttonApi($http,apiUrl){
        return{
          //getting the buttons coordinates from till_buttons
          getButtons: function(){
            var url = apiUrl + '/buttons';
            return $http.get(url);
          },
          //insert into the transaction table with the specified id
          clickButton: function(id, username){
            var url = apiUrl+'/click?id='+ id + '&usern=' + username;
            console.log("Attempting with "+url);
            return $http.post(url);
          },
          //remove all transaction data
          voidButton: function(){
            var url = apiUrl + '/void';
            console.log("Attempting with "+url);
            return $http.post(url);
          },
          //querying the database for the transaction table
          getList: function(){
            var url = apiUrl + '/list';
            console.log("Attempting with " + url);
            return $http.get(url);
          },
          //deleting the specified record with the coresponding id
          deleteItem: function(id){
            var url = apiUrl + '/delete?id=' + id;
            console.log("Attempting with "+url);
            return $http.post(url);
          },
          //Summing up the total cost of the transaction
          totalAmount: function(){
            var url = apiUrl + '/total';
            console.log("Attempting with "+url);
            return $http.get(url);
          },
          loginCheck: function(username, password){
            var url = apiUrl + '/login?usern=' + username + '&pw=' + password;
            console.log("Attempting with "+url);
            return $http.get(url);
          },
          checkOutButton: function(username){
            var url = apiUrl + '/sale?usern=' + username;
            console.log("Attempting with "+url);
            return $http.post(url);
          }
       };
      }
