/**
 * Auth: Brian W. Howell
 * Desc: Visualization of Steemit activity on the steem blockchain
 * 
 */
var SteemitPond = (function() {

    // Websocket
    var server = 'wss://this.piston.rocks';
    var ws = new WebSocketWrapper(server);
    var steem = new SteemWrapper(ws);

    var pond = $('#steemit-pond'); // app container element
    var lastIrreversibleBlock = 0; // track last block to avoid parsing multiple times

    // Just some useful constants
    var DOMAIN = "http://steemit.com/";
    var SIDE_MENU_WIDTH = 350;
    var COOKIE = "STEEMIT_POND_USER_FILTERS_COOKIE";
    var COOKIE_DEFAULTS = ['@mynameisbrian', '@ned', '@dan'];

    // store usernames to filter in an array
    var userFilters = [];

    var init = function() {

        // TODO Preload images not in the legend ************

        init.menu();
        pollLatestBlock();
    };

    // Menu setup ----------------------------------------------------------------------------------

    init.menu = function() {
        $('#sound').click(function() { toggleSound(); });
        $('#user-filters').click(function() { openUserFiltersMenu(); });
        $('#app-info').click(function() { openInfoMenu(); });
        $('.close-menu-btn').click(function() { closeMenu(); });
        init.userFiltersInput();
        init.existingFilters();
    };

    init.userFiltersInput = function() {
        $('.add-user-filter-input').keypress(function(e) {
            if( e.which == 13) addUserFilter($('.add-user-filter-input').val());
        });
        $('.add-user-filter-submit').click(function() {
            addUserFilter($('.add-user-filter-input').val());
        });
    };

    init.existingFilters = function() {
        var cookie = Cookies.get(COOKIE);
        if (document.cookie.indexOf(COOKIE) < 0) {
            // apply some default filters
            for (var i = 0; i < COOKIE_DEFAULTS.length; i++) {
                addCookieFor(COOKIE_DEFAULTS[i]);
                userFilters.push(COOKIE_DEFAULTS[i]);
            }
        } else {
            userFilters = cookie.split(', ');
            userFilters = userFilters.slice(0, -1); // remove "" added to array from split
        }
        for (var i = 0; i < userFilters.length; i++) {
            if (userFilters[i] !== null) {
                addUserFilterListItemFor(userFilters[i]);
            }
        }
    };

    var toggleSound = function() {
        console.log('toggleSound() called');
        // TODO Check sound state based on the glyph icon $(#sound)
        // TODO Update the glyph icon
        // TODO Update the sound state
        // Options <span class="glyphicon glyphicon-volume-off"></span>
        //         <span class="glyphicon glyphicon-volume-down"></span>
    };

    var openUserFiltersMenu = function() {
        $('.info-menu').hide();
        $('.user-filters-menu').hide();
        $('#side-menu').addClass('sidenav-box-shadow').width(SIDE_MENU_WIDTH);
        $('.user-filters-menu').fadeIn(500);
    };

    var openInfoMenu = function() {
        $('.user-filters-menu').hide();
        $('.info-menu').show();
        $('#side-menu').addClass('sidenav-box-shadow').width(SIDE_MENU_WIDTH);
    };

    var closeMenu = function() {
        $('#side-menu').remove('sidenav-box-shadow').width(0);
    };

    // User filters --------------------------------------------------------------------------------

    var addUserFilter = function(filter) {
        filter = filter.replace(/ /g,'');
        filter = filter.replace(/,/g, '');
        // probably should run some more user name filters
        if (filter === '') return;
        if (filter.charAt(0) === '@') filter = filter.substr(1);
        // TODO check if exists already
        filter = filter.toLowerCase();
        filter = '@' + filter;
        addCookieFor(filter);
        userFilters.push(filter); // add to array
        // add only if username is not already a filter
        addUserFilterListItemFor(filter);
    };

    var addUserFilterListItemFor = function(user) {
        // and add li to the users filters menu
        var ul = $('.user-filters-menu').children('ul');
        var li = $('<li></li>');
        var text = user;
        var btn = $('<span class="glyphicon glyphicon-remove"></span>');
        btn.click(function() {
            removeUserFilter($(this).parent('li'));
        });
        li.append(text);
        li.append(btn);
        ul.append(li);
        $('.add-user-filter-input').val('');
    };

    var removeUserFilter = function(selectedListItem) {
        var user = selectedListItem.text();
        // remove from array
        var i = userFilters.indexOf(user);
        if (i != -1)
            userFilters.splice(i, 1);
        // remove cookie
        var cookie = Cookies.get(COOKIE);
        var replaceStr = user + ', ';
        cookie = cookie.replace(replaceStr,  '');
        Cookies.set(COOKIE, cookie, { expires: 365 });
        // remove li
        selectedListItem.hide().remove();
    };

    var addCookieFor = function(user) {
        var cookie = Cookies.get(COOKIE);
        if (!cookie)
            cookie = user + ', ';
        else
            cookie = cookie + user + ', ';
        Cookies.set(COOKIE, cookie, { expires: 365 });
    };

    // Steemit Pond --------------------------------------------------------------------------------

    var pollLatestBlock = function() {
        ws.connect().then(function(response) {
            steem.send('get_dynamic_global_properties',[], function(response) {
                if (lastIrreversibleBlock != response["last_irreversible_block_num"]) {
                    lastIrreversibleBlock = response["last_irreversible_block_num"];
                    parseTransactionsIn(lastIrreversibleBlock);
                }
                setTimeout(pollLatestBlock(), 1000);
            });
        });
    };

    var parseTransactionsIn = function(block) {
        steem.send("get_block", [block], function(block) {
            block.transactions.forEach(function(transaction) {
                filterTransactionBy(transaction.operations[0]);
            });
        });
    };

    var filterTransactionBy = function(operation) {
        var type = operation[0];
        var data = operation[1];
        switch (type) {
            case 'comment':
                filterCommentType(data); // filter applied
                break;
            case 'vote':
                filterVoteType(data); // filter applied
                break;
            case 'account_create':
                processAccountCreate(data);
                break;
            case 'account_update':
                processAccountUpdate(data); // filter applied
                break;
            case 'pow':
                processPow(data);
                break;
            case 'transfer':
                processTransfer(data);
                break;
            case 'limit_order_create':
                processLimitOrderCreate(data);
                break;
            //case 'limit_order_cancel':
                //break;
            default:
                break;
        }
    };

    /*----------------------*
     *  Comment processing  *
     *----------------------*/

    var filterCommentType = function(comment) {
        if (comment.title !== "") {
            processNewPost(comment);
        } else {
            processExistingPost(comment);
        }
    };

    var processNewPost = function(comment) {
        var postUrl = DOMAIN + comment.parent_permlink + '/@' + comment.author + '/' + comment.permlink;
        var authUrl = DOMAIN + '@' + comment.author;

        var title = $('<div class="new-post-title"></div>');
        var titleLink = $('<a target="_blank" href="' + postUrl + '">' + comment.title + '</a>');
        title.append(titleLink);
        var author = $('<div class="new-post-author"></div>');
        var authorLink = $('<a class="auth-url" target="_blank" href="' + authUrl + '">' + comment.author + '</a>');
        author.append(authorLink);
        var data = $('<div class="new-post-data"></div>');
        data.append(title);
        data.append(author);
        var imageLink = $('<a target="_blank" href="' + postUrl + '"></a>');
        var element = $('<div class="new-post"></div>');
        var image;

        if (userFilters.indexOf('@' + comment.author) > -1) {
            image = $('<img class="new-post-image" src="img/scuba-1.png" />');
        } else {
            image = $('<img class="new-post-image" src="img/whale.png" />');
        }

        imageLink.append(image);
        element.append(data);
        element.append(imageLink);
        swimLeftToRight(element, 350, 18000, 32000);
    };

    var processExistingPost = function(comment) {
        var parentUrl = 'steempond/@' + comment.parent_author;
        var parentPermlinkUrl = '/' + comment.parent_permlink;
        var authorUrl = '#@' + comment.author + '/';
        var commentUrl = DOMAIN + parentUrl + parentPermlinkUrl + authorUrl + comment.permlink;
        var author = $('<div class="existing-post-author">' + comment.author + '</div>');
        var link = $('<a target="_blank" href="' + commentUrl + '"></a>');
        
        var image;
        if (userFilters.indexOf("@" + comment.author) > -1) {
            image = $('<img class="existing-post-image" src="img/scuba-2.png" />');
            $(link).addClass("existing-post-link-filter-applied"); // use css to adjust size
        } else {
            image = $('<img class="existing-post-image" src="' + getMinnowImage() + '" />');
        }

        link.append(image);
        link.append(author);
        var element = $('<div class="existing-post"></div>');
        element.append(link);

        swimLeftToRight(element, 400, 22000, 38000);
    };

    // Returns path to random minnow image
    var getMinnowImage = function() {
        var imageNum = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        return 'img/minnow-' + imageNum + '.png';
    };

    /*-------------------*
     *  Vote processing  *
     *-------------------*/

    var filterVoteType = function(vote) {
        if(vote.weight < 0) {
            processDownvote(vote);
        } else {
            processUpvote(vote);
        }
    };

    var processUpvote = function(vote) {
        var postUrl = DOMAIN + 'steempond/@' + vote.author + '/' + vote.permlink;
        var voter = $('<div class="upvote-voter">' + vote.voter + '</div>');
        var link = $('<a target="_blank" href="' + postUrl + '"></a>');

        var image;
        if (vote.author === 'mynameisbrian') {
            // easter egg - upvote me
            image = $('<img class="upvote-image" src="img/easter-egg-1.png" />');
            $(link).addClass("upvote-link-easter-egg"); // use css to adjust size
        } else if (userFilters.indexOf('@' + vote.voter) > -1) {
            image = $('<img class="upvote-image" src="img/scuba-3.png" />');
            $(link).addClass("upvote-link-filter-applied"); // use css to adjust size
        } else {
            image = $('<img class="upvote-image" src="img/bubble.png" />');
            // randomize bubble image size to make things a bit prettier
            var bubbleWidth = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
            image.css('width', bubbleWidth);
        }

        link.append(image);
        link.append(voter);
        var element = $('<div class="upvote"></div>');
        element.append(link);

        floatFromBottomToTop(element, 125, 15000, 28000);
    };

    var processDownvote = function(vote) {
        var postUrl = DOMAIN + 'steempond/@' + vote.author + '/' + vote.permlink;
        var voter = $('<div class="downvote-voter">' + vote.voter + '</div>');
        var link = $('<a target="_blank" href="' + postUrl + '"></a>');

        var image;
        if (userFilters.indexOf('@' + vote.voter) > -1) {
            image = $('<img class="downvote-image" src="img/barrel.png" />');
            $(link).addClass("downvote-link-filter-applied"); // use css to adjust size
            $(link).css({ WebkitTransform: 'rotate(' + getGarbageRotation() + 'deg)'});
            $(link).css({ '-moz-transform': 'rotate(' + getGarbageRotation() + 'deg)'});
        } else {
            image = $('<img class="downvote-image" src="' + getGarbageImage() + '" />');
        }

        link.append(voter);
        link.append(image);
        var garbage = $('<div class="downvote"></div>');
        garbage.append(link);

        sinkToBottom(garbage, 125, 12000, 25000);
    };

    var getGarbageRotation = function() {
        var ran = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        return ran * plusOrMinus;
    };

    // Returns path to random garbage image
    var getGarbageImage = function() {
        var imageNum = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        return 'img/garbage-' + imageNum + '.png';
    };

    /*----------------------*
     *  Account processing  *
     *----------------------*/

    var processAccountCreate = function(account) {
        var newAcctUrl = DOMAIN + '@' + account.new_account_name;

        var accountName = $('<div class="new-account-name">' + account.new_account_name + '</div>');
        var image = $('<img class="new-account-image" src="img/dolphin-1.png" />');
        var link = $('<a target="_blank" href="' + newAcctUrl + '"></a>');
        link.append(accountName);
        link.append(image);
        var dolphin = $('<div class="new-account"></div>');
        dolphin.append(link);

        swimLeftToRight(dolphin, 400, 20000, 32000);
    };

    var processAccountUpdate = function(account) {
        var acctUrl = DOMAIN + '@' + account.account;
        var accountName = $('<div class="update-account-name">' + account.account + '</div>');
        var link = $('<a target="_blank" href="' + acctUrl + '"></a>');

        var image;
        if (userFilters.indexOf('@' + account.account) > -1) {
            image = image = $('<img class="update-account-image" src="img/scuba-4.png" />');
            $(link).addClass("account-update-link-filter-applied"); // use css to adjust size
        } else {
            image = $('<img class="update-account-image" src="img/baluga.png" />');
        }

        link.append(accountName);
        link.append(image);
        var baluga = $('<div class="update-account"></div>');
        baluga.append(link);

        swimLeftToRight(baluga, 400, 25000, 35000);
    };

    /*--------------------------------*
     *  Money related txs processing  *
     *--------------------------------*/

    var processTransfer = function(transfer) {
        var fromUrl = DOMAIN + '@' + transfer.from;
        var toUrl = DOMAIN + '@' + transfer.to;

        var from = $('<div class="transfer-from"></div>');
        var fromText = $('<div>' + transfer.amount + ' from <a target="_blank" href="' + fromUrl + '">' + transfer.from + '</a>');
        var fromImg = $('<a target="_blank" href="' + fromUrl + '"><img src="img/barracuda.png" /></a>');
        from.append(fromText);
        from.append(fromImg);

        var to = $('<div class="transfer-to"></div>');
        var toText = $('<div>to <a target="_blank" href="' + toUrl + '">' + transfer.to + '</a>');
        var toImg = $('<a target="_blank" href="' + toUrl + '"><img src="img/barracuda.png" /></a>');
        // TODO Add user filter
        to.append(toText);
        to.append(toImg);

        var barracudas = $('<div class="transfer"></div>');
        barracudas.append(from);
        barracudas.append(to);

        swimLeftToRight(barracudas, 400, 30000, 40000);
    };

    var processLimitOrderCreate = function(order) {
        var ownerUrl = DOMAIN + '@' + order.owner;
        var owner = $('<a class="limit-create-owner" target="_blank" href="' + ownerUrl + '">' + order.owner + '</a>');
        var image = $('<img class="limit-create-image" src="img/turtle.png" />');
        // TODO user filter
        var amount = $('<div>' + order.amount_to_sell + '</div>');
        var link = $('<a target="_blank" href="' + ownerUrl + '"></a>');
        var element = $('<div class="limit-create"></div>');
        link.append(amount);
        link.append(image);
        link.append(owner);
        element.append(link);
        swimLeftToRight(element, 400, 35000, 45000);
    };

    /*---------------------*
     *  Mining processing  *
     *---------------------*/

    var processPow = function(pow) {
        var acctUrl = DOMAIN + '@' + pow.worker_account;

        var accountName = $('<div class="pow-account-name">' + pow.worker_account + '</div>');
        var link = $('<a target="_blank" href="' + acctUrl + '"></a>');
        var image = $('<img class="pow-image" src="img/shark-1.png" />');
        // TODO Add user filter
        link.append(image);
        link.append(accountName);
        var shark = $('<div class="pow"></div>');
        shark.append(link);

        swimLeftToRight(shark, 400, 28000, 40000);
    };

    /*--------------*
     *  Animations  *
     *--------------*/

    var swimLeftToRight = function(element, maxVertTraverseDist, minHorzTraverseTime, maxHorzTraverseTime) {

        // Setup starting location for element
        var minVertStartPos = $('header').height() + maxVertTraverseDist;
        var maxVertStartPos = $(window).height() - maxVertTraverseDist - element.height();
        var randomStartPos = Math.floor(Math.random() * (maxVertStartPos - minVertStartPos + 1)) + minVertStartPos;
        pond.append(element);
        element.css({
            position : 'absolute',
            top : randomStartPos,
            left: 0 - element.width()
        });

        // Swim across the screen
        var speed = Math.floor(Math.random() * (maxHorzTraverseTime - minHorzTraverseTime + 1)) + minHorzTraverseTime;
        var minVertFinishPos = element.offset().top - maxVertTraverseDist;
        var maxVertFinishPos = element.offset().top + maxVertTraverseDist;
        var randomFinishPos = Math.floor(Math.random() * (maxVertFinishPos - minVertFinishPos + 1)) + minVertFinishPos;
        element.animate({
            left : '105%',
            top : randomFinishPos
        }, speed, function() {
            element.remove();
        });
    };
 
    var floatFromBottomToTop = function(element, maxHorzTraverseDist, minVertTraverseTime, maxVertTraverseTime) {
        
        // Setup starting location for element
        var minHorzStartPos = maxHorzTraverseDist;
        var maxHorzStartPos = $(window).width() - maxHorzTraverseDist - element.width();
        var randomStartPos = Math.floor(Math.random() * (maxHorzStartPos - minHorzStartPos + 1)) + minHorzStartPos;
        pond.append(element);
        element.css({
            position : 'absolute',
            top : $(window).height() + element.height(),
            left : randomStartPos
        });

        // Float up to the top of screen
        var speed = Math.floor(Math.random() * (maxVertTraverseTime - minVertTraverseTime + 1)) + minVertTraverseTime;
        var minHorzFinishPos = element.offset().left - maxHorzTraverseDist;
        var maxHorzFinishPos = element.offset().left + maxHorzTraverseDist;
        var randomFinishPos = Math.floor(Math.random() * (maxHorzFinishPos - minHorzFinishPos + 1)) + minHorzFinishPos;
        element.animate({
            left : randomFinishPos,
            top : 0 - element.height()
        }, speed, 'linear', function() {
            element.remove();
        });
    };

    var sinkToBottom = function(element, maxHorzTraverseDist, minVertTraverseTime, maxVertTraverseTime) {
        var LEFT_RIGHT_MAX = 100; // distance garbage can traverse left or right
        var MIN_GARBAGE_SPEED = 10000;
        var MAX_GARBAGE_SPEED = 20000;

        // Setup starting location for bubble
        var minHorzStartPos = maxHorzTraverseDist;
        var maxHorzStartPos = $(window).width() - maxHorzTraverseDist - element.width();
        var randomStartPos = Math.floor(Math.random() * (maxHorzStartPos - minHorzStartPos + 1)) + minHorzStartPos;
        pond.append(element);
        element.css({
            position : 'absolute',
            top : 0 - element.height() - 50,
            left : randomStartPos
        });

        // Sink down to bottom of the screen
        var speed = Math.floor(Math.random() * (maxVertTraverseTime - minVertTraverseTime + 1)) + minVertTraverseTime;
        var minHorzFinishPos = element.offset().left - maxHorzTraverseDist;
        var maxHorzFinishPos = element.offset().left + maxHorzTraverseDist;
        var randomFinishPos = Math.floor(Math.random() * (maxHorzFinishPos - minHorzFinishPos + 1)) + minHorzFinishPos;
        element.animate({
            left : randomFinishPos,
            top : $(window).height() + element.height()
        }, speed, function() {
            element.remove();
        });
    };

    /*
    // TESTING
    var testingData = {
        // add testing data here
    };

    var testing = function() {
        processLimitOrderCreate(testingData); // update to test
        setTimeout(testing, 5000);
    };

    testing();
    // END TESTING
    */

    /**
     * Return SteemitPond API
     */
    return {
        init : init // gets the ball rolling
    };

})(); // SteemitPond

$( document ).ready(function() {
    if (window.WebSocket) {
        SteemitPond.init();
    } else {
        alert('Websocket is not supported by your browser.');
    }
});
