/*
TODO
- Info and about
- Add to github
- Update your server
- Add to server
- Analytics
-
- Media queries to resize fish based on screen
- Don't forget to credit your images
---------------------------------------
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

    // Doesn't ensure that image assets are preloaded, but gives them a fighting chance.
    var preloadImageAssets = function() {
        $('<img src="img/whale.png" />');
        $('<img src="img/minnow-1.png" />');
        $('<img src="img/minnow-2.png" />');
        $('<img src="img/minnow-3.png" />');
        $('<img src="img/minnow-4.png" />');
        $('<img src="img/minnow-5.png" />');
        $('<img src="img/bubble.png" />');
        pollLatestBlock();
    }

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
            default:
                break;
        }
    };

    var filterCommentType = function(comment) {
        if (comment.title != "") {
            processNewPost(comment);
        } else {
            processExistingPost(comment);
        }
    };

    var processNewPost = function(comment) {
        var postUrl = DOMAIN + comment.parent_permlink + '/@' + comment.author + '/' + comment.permlink;
        var authUrl = DOMAIN + '@' + comment.author;

        var title = $('<div class="new-post-fish-title"></div>')
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

        initFishElement(fish);
    };

    var processExistingPost = function(comment) {
        var commentUrl = DOMAIN + 'steempond/@' + comment.parent_author + '/'
                + comment.parent_permlink + '#@' + comment.author + '/' + comment.permlink;

        var author = $('<div class="existing-post-fish-author">' + comment.author + '</div>');
        var image = $('<img class="existing-post-fish-image" src="' + getMinnowImage() + '" />');
        var link = $('<a target="_blank" href="' + commentUrl + '"></a>');
        link.append(author);
        link.append(image);
        var fish = $('<div class="existing-post-fish"></div>');
        fish.append(link);

        initFishElement(fish);
    };

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

        initBubbleElement(bubble);
    };

    // Returns path to random minnow image
    var getMinnowImage = function() {
        var imageNum = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        return 'img/minnow-' + imageNum + '.png';
    }

    var processDownvote = function(vote) {
        var postUrl = DOMAIN + 'steempond/@' + vote.author + '/' + vote.permlink;
        
        var voter = $('<div class="downvote-garbage-voter">' + vote.voter + '</div>');
        var image = $('<img class="downvote-garbage-image" src="' + getGarbageImage() + '" />');
        var link = $('<a target="_blank" href="' + postUrl + '"></a>');
        link.append(voter);
        link.append(image);
        var garbage = $('<div class="downvote-garbage"></div>');
        garbage.append(link);

        initGarbageElement(garbage);
    };

    // Returns path to random minnow image
    var getGarbageImage = function() {
        var imageNum = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        return 'img/garbage-' + imageNum + '.png';
    }

    var initFishElement = function(fish) {
        var FADE_SPEED      
        var HEADER_HEIGHT = 60;
        var UP_DOWN_MAX = 400; // distance fish can up or down from initial starting point
        var MIN_FISH_SPEED = 28000;
        var MAX_FISH_SPEED = 40000;

        // Setup starting location for fish
        var minStartAt = HEADER_HEIGHT + UP_DOWN_MAX;
        var maxStartAt = $(window).height() - UP_DOWN_MAX - fish.height();
        var startAt = Math.floor(Math.random() * (maxStartAt - minStartAt + 1)) + minStartAt;
        pond.append(fish);
        fish.css({
            position : 'absolute',
            top : startAt,
            left: 0 - fish.width()
        });

        // Swim across the screen
        var speed = Math.floor(Math.random() * (MAX_FISH_SPEED - MIN_FISH_SPEED + 1)) + MIN_FISH_SPEED;
        var minFinishAt = fish.offset().top - UP_DOWN_MAX;
        var maxFinishAt = fish.offset().top + UP_DOWN_MAX;
        var finishAt = Math.floor(Math.random() * (maxFinishAt - minFinishAt + 1)) + minFinishAt;
        fish.animate({
            left : '105%',
            top : finishAt
        }, speed, function() {
            fish.remove();
        });

    }; // initFishElement

    var initBubbleElement = function(bubble) {
        var LEFT_RIGHT_MAX = 100; // distance bubbles can traverse left or right
        var MIN_BUBBLE_SPEED = 15000;
        var MAX_BUBBLE_SPEED = 20000;

        // Setup starting location for bubble
        var minStartAt = LEFT_RIGHT_MAX;
        var maxStartAt = $(window).width() - LEFT_RIGHT_MAX - bubble.width();
        var startAt = Math.floor(Math.random() * (maxStartAt - minStartAt + 1)) + minStartAt;
        pond.append(bubble);

        bubble.css({
            position : 'absolute',
            top : $(window).height() + bubble.height(),
            left : startAt
        });

        // Float up to the top of screen
        var speed = Math.floor(Math.random() * (MAX_BUBBLE_SPEED - MIN_BUBBLE_SPEED + 1)) + MIN_BUBBLE_SPEED;
        var minFinishAt = bubble.offset().left - LEFT_RIGHT_MAX;
        var maxFinishAt = bubble.offset().left + LEFT_RIGHT_MAX;
        var finishAt = Math.floor(Math.random() * (maxFinishAt - minFinishAt + 1)) + minFinishAt;
        bubble.animate({
            left : finishAt,
            top : 0 - bubble.height()
        }, speed, 'linear', function() {
            bubble.remove();
        });

    }; // initBubbleElement

    var initGarbageElement = function(garbage) {
        var LEFT_RIGHT_MAX = 100; // distance garbage can traverse left or right
        var MIN_GARBAGE_SPEED = 10000;
        var MAX_GARBAGE_SPEED = 20000;

        // Setup starting location for bubble
        var minStartAt = LEFT_RIGHT_MAX;
        var maxStartAt = $(window).width() - LEFT_RIGHT_MAX - garbage.width();
        var startAt = Math.floor(Math.random() * (maxStartAt - minStartAt + 1)) + minStartAt;
        pond.append(garbage);
        garbage.css({
            position : 'absolute',
            top : 0 - garbage.height(),
            left : startAt
        });

        // Sink down to bottom of the screen
        var speed = Math.floor(Math.random() * (MAX_GARBAGE_SPEED - MIN_GARBAGE_SPEED + 1)) + MIN_GARBAGE_SPEED;
        var minFinishAt = garbage.offset().left - LEFT_RIGHT_MAX;
        var maxFinishAt = garbage.offset().left + LEFT_RIGHT_MAX;
        var finishAt = Math.floor(Math.random() * (maxFinishAt - minFinishAt + 1)) + minFinishAt;
        garbage.animate({
            left : finishAt,
            top : $(window).height() + garbage.height()
        }, speed, function() {
            garbage.remove();
        });

    }; // initGarbageElement

    return { 
        init : preloadImageAssets // gets the ball rolling
    };

})(); // SteemitPond

$( document ).ready(function() {
    if (window.WebSocket) {
        SteemitPond.init();
    } else {
        alert('Websocket is not supported by your browser.');
    }
});
