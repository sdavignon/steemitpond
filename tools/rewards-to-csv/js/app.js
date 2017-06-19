jQuery(document).ready(function() {

    var Steem = (function() {

        var searchName;

        var validateUsername = function(username) {
            searchName = username;
            followerNames = [];
            followerAccounts = [];
            steem.api.getAccounts([username], function(err, response){
                if (response.length === 1) {
                    getRewards(username, null);
                } else {
                    InputForm.displayUsernameInputError();
                    InputForm.hideSpinner();
                }
            });
        };

        var getRewards = function(username, from) {
            console.log("fetching account history");
            steem.api.getContent(username, null, function(err, result) {

                console.log(result);

                InputForm.hideSpinner();
                InputForm.clearInput();

            });
        };

        /*
        var getFollowers = function(username, from) {
            steem.api.getFollowers(username, from, 'blog', 100, function(err, result) {
                var startNextLoopFrom;
                for (var i = 0; i < result.length; i++) {
                    followerNames.push(result[i].follower);
                    if (i === 99) {
                        startNextLoopFrom = result[i].follower;
                    }
                }
                if (result.length === 100) {
                    followerNames.pop(); // avoids duplicating follower with next loop
                    getFollowers(username, startNextLoopFrom);
                } else {
                    steem.api.getAccounts(followerNames, function(err, response){
                        for (var i = 0; i < response.length; i++) {
                            followerAccounts.push(response[i]);
                        }
                        Landing.el.fadeOut(500, function() {
                            Results.init(followerAccounts);
                            Results.setUsername(searchName);
                            Results.setTotal(followerNames.length);
                            Results.update();
                            Results.el.fadeIn(500);
                        });
                        Landing.hideSpinner();
                        Landing.clearInput();
                    });
                }
            });
        };
        */

        return {
            getData: validateUsername,
        };

    })(); // Steem

    var InputForm = (function() {

        var el = $('.landing');
        var input = $('#main-username-input');
        var submit = $('#main-username-submit');

        var getFormattedUsernameFrom = function(someInput) {
            var inputValue = someInput.val();
            if (inputValue.charAt(0) === '@') {
                inputValue = inputValue.substr(1);
            }
            return inputValue.toLowerCase();
        };

        var displayUsernameInputError = function() {
            var errorMsg = $('.main-username-input-error');
            if (!errorMsg.is(':visible')) {
                errorMsg.fadeIn().delay(5000).fadeOut();
            }
        };

        var displaySpinner = function() {
            submit.html('<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>');
        };

        var hideSpinner = function() {
            submit.text('Go!');
        };

        var clearInput = function() {
            input.val('');
        };

        submit.click(function() {
            var inputValue = getFormattedUsernameFrom(input);
            if (inputValue !== '') {
                displaySpinner();
                Steem.getData(inputValue);
            }
        });

        input.keydown(function(e) {
            if (e.keyCode == 13) {
                event.preventDefault();
                submit.click();
            }
        });

        return {
            el: el,
            displayUsernameInputError: displayUsernameInputError,
            displaySpinner: displaySpinner,
            hideSpinner: hideSpinner,
            clearInput: clearInput
        };

    })(); // InputForm

});
