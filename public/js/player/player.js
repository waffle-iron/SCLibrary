console.log("client_id: " + client_id);

SC.initialize({
    client_id: client_id
});

//make this autoplay, or make it so sometimes it will
var smOptions = {
    useHTML5Audio: true,
    preferFlash: false,
    auto_play: true
};

var isPlaying = false;

var lastPlayer;

var playIcon = 'url(../../images/sc_icons/play.svg)';
var pauseIcon = 'url(../../images/sc_icons/pause.svg)';

//to use the extendable player library put this in the html
//	<a href="http://soundcloud.com/matas/hobnotropic" class="sc-player">My new dub track</a>
//but has MIT license lel

// stream track id 293
//http://www.schillmania.com/projects/soundmanager2/doc for "soundmanager" docs aka the palyer object
//for waveforms MAYBE use this library (mit license = we have to share source?): http://www.waveformjs.org/
//use waveform_url to get the waveform
//for waveform stuff check out:
//http://www.waveformjs.org/#examples
function loadSong(trackid, durationms, artworkurl, waveformurl) {

    SC.stream('/tracks/' + trackid, smOptions).then(function (player) {

            //Reset all remnants of the last song player
            if (lastPlayer) {
                //console.log(lastPlayer._isPlaying);
                if (lastPlayer.isPlaying()) {
                    lastPlayer.pause();
                    isPlaying = false;
                    lastPlayer.dispose();
                }
            }
            //Reset isPlaying boolean, change the 
            isPlaying = false;
            $('#pauseplay').css('background-image', playIcon);
            //$('#seekicon').css("left", "0%");
            $('#seekicon').css("width", "0%");

            //Load artwork image to DOM
            $('#artworkimg').css('background-image', "url(" + artworkurl + ")");
            //Load waveform image to DOM
            $('#waveformimg').attr('src', waveformurl);

            //expand the player 
            $('#player').addClass('playing');

            $('#waveformimg').on('load', function () {
                var thisH = $('#waveformimg').height();
                var thisM = thisH + 60;
                $('#artworkimg').css('height', thisH.toString() + "px");
                $('#artworkimg').css('width', thisH.toString() + "px");
                $('#library').css('margin-top', thisM.toString() + "px");
            });

            // resize function to keep the artwork square
            $(window).on('resize', function () {
                var thisH = $('#waveformimg').height();
                var thisM = thisH + 60;
                $('#artworkimg').css('height', thisH.toString() + "px");
                $('#artworkimg').css('width', thisH.toString() + "px");
                $('#library').css('margin-top', thisM.toString() + "px");
            });

            lastPlayer = player;
            //console.log(lastPlayer);
            var duration = durationms;

            //Tie our pauseplay button to the "play" and "pause" events from the player
            player.on('play', function () {
                $('#pauseplay').css('background-image', pauseIcon);
            });
            player.on('pause', function () {
                $('#pauseplay').css('background-image', playIcon);
            });

            //Auto play song
            player.play();
            isPlaying = true;
            //Tie out pause/play button to the "player" objects pause / play functions
            $('#pauseplay').unbind('click').click(function (e) {
                console.log('pauseplay clicked');
                if (isPlaying && player.isPlaying()) {
                    player.pause();
                    isPlaying = false;
                } else {
                    // TODO stop reseting pos on play somehow
                    var pos = $('#back-div').width();
                    var width = $('#waveformimg').width();
                    var relativePercent = pos / (width * 1.0);
                    var seekPosition = Math.round(duration * relativePercent);
                    /*alert(seekPosition);
                    player.seek(seekPosition);*/
                    player.play();
                    isPlaying = true;
                }
            });

            $('#player').unbind('click').click(function (e) {
                //how offset the current element is from the x=0 axis
                var offset = $('#artworkimg').width();
                var width = $('#waveformimg').width();
                //relativeOffset = how far into the div's width you clicked in pixels
                var relativeOffset = e.pageX - offset;
                console.log(e.pageX - offset + "x");
                //how far you clicked into the div's width by percent. 1.0 is to cast to double
                var relativePercent = relativeOffset / (width * 1.0);
                //console.log(relativePercent*100+"%");
                //position in miliseconds of total song
                var seekPosition = Math.round(duration * relativePercent);
                console.log("seekpos: " + seekPosition);
                player.seek(seekPosition);
            });

            //TODO, (maybe, or just have a func that passes these params, ajax can call that func) grab the duration from the backend like we do client_id above, that is how we calculate how much of the song has been listened to. wtf why isn't there a better way...
            //TODO (sames) grab the waveform url from backend like above
            player.on('time', function () {
                //Get rid of all decimal points except first 2
                var percentPlayed = Math.floor((player.currentTime() / duration) * 10000) / 100;
                //console.log(percentPlayed + "% played");
                // added back div to make waveform orange.
                $('#back-div').css("width", percentPlayed.toString() + "%");
                //$('#seekicon').css("left", percentPlayed.toString() + "%");
            });

            //player.on('time', function(){console.log("pos: " : this.position);});
            //soundPlayer = sound;
            //html5Audio = sound._player._html5Audio;
            //html5Audio.addEventListener('ended', function(){ console.log('event fired: ended'); });
        },
        function (error) {
            console.log(error);
        });
}

function attachColHandles() {
    $('.col-sizeable').each(function () {
        // multiple loops and class vs id
        $(this).children('li').each(function () {
            var thisClass = "." + $(this).find('a').text().toLowerCase();
            // make each col-header resizable
            $(this).resizable({
                autoHide: true,
                minWidth: 150,
                //containment: "parent",
                minHeight: 30,
                maxHeight: 30,
                // make the other li's in the column resize
                alsoResize: thisClass,
                resize: function (event, ui) {
                    var colCount = $(this).siblings().length;
                    var exWidth = $(this).parent().width() - $(this).width();

                    $(this).siblings().each(function () {
                        // set decreased width to other header
                        // can change function to modify feeling
                        $(this).trigger($.Event('resize'));
                        $(this).width(exWidth / colCount - 10);
                    });
                }
            });

            // bind a function to change other column widths
            $(this).bind('resize', function () {
                if (!$(this).hasClass('ui-resizable-resizing')) {
                    var currW = $(this).width();
                    $(thisClass).each(function () {
                        $(this).width(currW);
                    });
                }
            });
        });

    });
}
