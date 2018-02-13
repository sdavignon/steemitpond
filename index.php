<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>SteemSea</title>
    <meta name="description" content="SteemSea a is real-time visualization of current Steemit activity - with an aquatic theme">
    <meta name="author" content="Brian W. Howell">
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <link rel="icon" href="img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" type="text/css" href="css/steemitpond.min.css?v=1">
</head>
<body>

<header>
    <img class="logo" src="img/logo.png" alt="White Steemit Logo" />
    <h1>SteemSea</h1>
    <ul>
        <li id="sound"><span class="glyphicon glyphicon-volume-off" aria-hidden="true"></span></li>
        <li id="user-filters"><span class="glyphicon glyphicon-eye-close"></span></li>
        <li id="app-info"><span class="glyphicon glyphicon-info-sign"></span></li>
    </ul>
</header>

<div id="side-menu" class="sidenav">
	<a href="javascript:void(0)" class="close-menu-btn">&times;</a>
    <div class="menus-container">

        <!-- User filters -->
        <div class="user-filters-menu">
            <div class="add-user">
                <h2>Filter Users</h2>
                <p>Entering a username and user transactions<br /> will appear as scuba divers in the sea</p>
                <div class="add-user-filter-input-container">
                    <input class="add-user-filter-input" type="text" />
                    <div class="add-user-filter-submit">
                        <span class="glyphicon glyphicon-ok-circle"></span>
                    </div>
                </div>
            </div>
            <ul><!-- User filters go here --></ul>
        </div> <!-- .user-filters-menu -->

        <!-- Info -->
        <div class="info-menu">
        	<h2 id="legend-title">Legend</h2>
        	<h3>New Top Level Post</h3>
        	<div class="legend-image-container">
        		<img class="legend-image-full" src="img/whale.png" alt="New post" />
        	</div>
        	<h3>Comment Made on Existing Post</h3>
        	<div class="legend-image-container">
        		<img class="legend-image-third" src="img/minnow-3.png" alt="Comment on existing post" />
        		<img class="legend-image-third" src="img/minnow-4.png" alt="Comment on existing post" />
        		<img class="legend-image-third" src="img/minnow-5.png" alt="Comment on existing post" />
                <br />
        		<img class="legend-image-third" src="img/minnow-1.png" alt="Comment on existing post" />
        		<img class="legend-image-third" src="img/minnow-2.png" alt="Comment on existing post" />
        	</div>
        	<h3>Upvote</h3>
        	<div class="legend-image-container">
        		<img src="img/bubble.png" alt="Upvote" />
        	</div>
        	<h3>Downvote</h3>
        	<div class="legend-image-container">
        		<img class="legend-image-third" src="img/garbage-1.png" alt="Downvote" />
        		<img class="legend-image-third" src="img/garbage-2.png" alt="Downvote" />
        	</div>
            <h3>New Account Created</h3>
            <div class="legend-image-container">
                <img class="legend-image-half" src="img/dolphin-1.png" alt="New account" />
            </div>
            <h3>Existing Account Updated</h3>
            <div class="legend-image-container">
                <img class="legend-image-half" src="img/baluga.png" alt="Existing account updated" />
            </div>
            <h3>Miner Proof of Work</h3>
            <div class="legend-image-container">
                <img class="legend-image-two-third" src="img/shark-1.png" alt="Miner proof of work" />
            </div>
            <h3>Transfers</h3>
            <div class="legend-image-container">
                <img class="legend-image-two-third" src="img/barracuda.png" alt="Transfer" />
            </div>
            <h3>Limit Order</h3>
            <div class="legend-image-container">
                <img class="legend-image-half" src="img/turtle.png" alt="Transfer" />
            </div>
            <h2>Filtered Posts</h2>
            <h3>New Top Level Post<h3>
            <img class="legend-image-half" src="img/scuba-1.png" alt="" />
            <h3>Comment on Existing Post<h3>
            <img class="legend-image-half" src="img/scuba-2.png" alt="" />
            <h3>Account Updated<h3>
            <img class="legend-image-half" src="img/scuba-4.png" alt="" />
            <h3>Upvote<h3>
            <img class="legend-image-third" src="img/scuba-3.png" alt="" />
            <h3>Downvote<h3>
            <img class="legend-image-third" src="img/barrel.png" alt="" />
        	<br /><br /><hr />
        	<a class="info-link" target="_blank" href="http://bri.how">Brian W. Howell</a>
        	<a class="info-link" target="_blank" href="http://steemit.com/@mynameisbrian">@mynameisbrian</a>
        	<a class="info-link" target="_blank" href="https://github.com/bigbhowell/steemitpond">Source Code</a>
        	<br /><br />
        </div> <!-- .info-menu -->

    </div> <!-- .menus-container -->
</div> <!-- #side-menu -->

<!-- Steemit Pond container -->
<div id="steemit-pond-container">
    <div id="steemit-pond" class="bg-image"></div>
</div>

<footer>
    
</footer>

<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
<script src="js/steemitpond.min.js"></script>




</body>
</html>

