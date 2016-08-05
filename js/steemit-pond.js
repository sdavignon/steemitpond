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
                filterCommentType(data);
                break;
            case 'vote':
                filterVoteType(data);
                break;
            case 'account_create':
                processAccountCreate(data);
                break;
            case 'account_update':
            case 'transfer':
            case 'limit_order_create':
            case 'limit_order_cancel':
            case 'pow':
                break;
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

        var title = $('<div class="new-post-fish-title"></div>');
        var titleLink = $('<a target="_blank" href="' + postUrl + '">' + comment.title + '</a>');
        title.append(titleLink);
        var author = $('<div class="new-post-fish-author"></div>');
        var authorLink = $('<a class="auth-url" target="_blank" href="' + authUrl + '">' + comment.author + '</a>');
        author.append(authorLink);
        var data = $('<div class="new-post-fish-data"></div>');
        data.append(title);
        data.append(author);
        var imageLink = $('<a target="_blank" href="' + postUrl + '"></a>');
        var image = $('<img class="new-post-fish-image" src="img/whale.png" />');
        imageLink.append(image);
        var fish = $('<div class="new-post-fish"></div>');
        fish.append(data);
        fish.append(imageLink);

        // TODO Resize
        //fish.css('height', '50px');
        swimLeftToRight(fish, 350, 18000, 32000);
    };

    var processExistingPost = function(comment) {
        var parentUrl = 'steempond/@' + comment.parent_author;
        var parentPermlinkUrl = '/' + comment.parent_permlink;
        var authorUrl = '#@' + comment.author + '/';
        var commentUrl = DOMAIN + parentUrl + parentPermlinkUrl + authorUrl + comment.permlink;

        var author = $('<div class="existing-post-fish-author">' + comment.author + '</div>');
        var image = $('<img class="existing-post-fish-image" src="' + getMinnowImage() + '" />');
        var link = $('<a target="_blank" href="' + commentUrl + '"></a>');
        link.append(image);
        link.append(author);
        var fish = $('<div class="existing-post-fish"></div>');
        fish.append(link);

        swimLeftToRight(fish, 400, 22000, 38000);
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

        var image = $('<img class="upvote-bubble-image" src="img/bubble.png" />');
        // randomize bubble image size to make things a bit prettier
        var bubbleWidth = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
        image.css('width', bubbleWidth);
        var voter = $('<div class="upvote-bubble-voter">' + vote.voter + '</div>');
        var link = $('<a target="_blank" href="' + postUrl + '"></a>');
        link.append(image);
        link.append(voter);
        var bubble = $('<div class="upvote-bubble"></div>');
        bubble.append(link);

        floatFromBottomToTop(bubble, 125, 15000, 28000);
    };

    var processDownvote = function(vote) {
        var postUrl = DOMAIN + 'steempond/@' + vote.author + '/' + vote.permlink;
        
        var voter = $('<div class="downvote-garbage-voter">' + vote.voter + '</div>');
        var image = $('<img class="downvote-garbage-image" src="' + getGarbageImage() + '" />');
        var link = $('<a target="_blank" href="' + postUrl + '"></a>');
        link.append(voter);
        link.append(image);
        var garbage = $('<div class="downvote-garbage"></div>');
        garbage.append(link);

        sinkToBottom(garbage, 125, 12000, 25000);
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
        var image = $('<img class="new-account-dolphin-image" src="img/dolphin-1.png" />');
        var link = $('<a target="_blank" href="' + newAcctUrl + '"></a>');
        link.append(accountName);
        link.append(image);
        var dolphin = $('<div class="new-account-dolphin"></div>');
        dolphin.append(link);

        swimLeftToRight(dolphin, 400, 20000, 32000);
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
            top : 0 - element.height(),
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

    /**
     * Return SteemitPond API
     */
    return { 
        init : pollLatestBlock // gets the ball rolling
    };

})(); // SteemitPond

$( document ).ready(function() {
    if (window.WebSocket) {
        SteemitPond.init();
    } else {
        alert('Websocket is not supported by your browser.');
    }
});
