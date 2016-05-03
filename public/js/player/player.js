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

// used to track resize direction

var left = false;

function snapToPercents(parentEl) {
  var parWid = parentEl.width();
  var colCt = parentEl.children().length;
  var catchAdd = 0;
  var j = 0;
  console.log(parWid + " - " + colCt);
  parentEl.children('li').each(function () {
    // iterate through li + siblings
    var eachC = "." + $(this).find('a').text().toLowerCase();
    if (j == colCt - 1) {
      // force clearing
      var catchAll = 100.0 - catchAdd;
      //console.log(catchAdd + " + " + catchAll);
      $(this).css('width', catchAll.toString() + "%");
    } else {
      var perW = ($(this).width()/parWid) * 100;
      $(this).css('width', perW.toString() + "%");
      //console.log(j + " - " + perW.toString() + "%");
      catchAdd += perW;
    }
    // resize col's below
    $(eachC).each(function () {
      if (j == colCt - 1) {
        $(this).css('width', catchAll.toString() + "%");
      } else {
        $(this).css('width', perW.toString() + "%");
      }
    });
    j++;
  });
}

function attachColHandles() {
    $('.col-sizeable').each(function () {
        // multiple loops and class vs id
        $(this).children('li').each(function () {
            // elements with class matching col header
            // are resized in stop fn
            var thisClass = "." + $(this).find('a').text().toLowerCase();

            // keep handles off first/last cols
            if ($(this).is('li:last-of-type')) {
              var handles = 'sw';
            } else if ($(this).is('li:first-of-type')) {
              var handles = 'se';
            } else {
              var handles = 'se, sw';
            }

            // make each col-header resizable
            $(this).resizable({
                handles: handles,
                autoHide: true,
                minHeight: 30,
                maxHeight: 30,
                
                resize: function (event, ui) {
                    // hack to determine resize dir
                    var srcEl = event.originalEvent.originalEvent.path[0].className;
                    var dragD = srcEl.replace('ui-resizable-handle ui-resizable-', '');
                    var dragC = srcEl.replace('ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-', '');

                    // toggle direction global
                    // as dragD/C value is somewhat unpredictable
                    if (dragD == 'sw' || dragC == 'sw') {
                        left = true;
                    } else if (dragD == 'se' || dragC == 'sw') {
                        left = false;
                    }

                    var headerW = $(this).parent().width();

                    // behaviour varies by drag side
                    if (!left) {
                        var colCount = $(this).nextAll('li').length;
                        var cumW = 0;
                        $(this).prevAll().each(function(){
                          // sum col widths to the left
                          cumW += $(this).width();
                        });
                        cumW += $(this).width();
                        $(this).nextAll().each(function () {
                            // set decreased width to other headers
                            $(this).width(((headerW - cumW) / colCount) - 5);
                        });
                    } else {
                        // left-side drag
                        var colCount = $(this).prevAll().length;
                        var cumW = 0;
                        $(this).nextAll().each(function(){
                          // sum col widths to the right
                          // round to assist clearing
                          cumW += $(this).width();
                        });
                        cumW += $(this).width();

                        var k = 0;
                        var runW = 0;
                        $(this).prevAll().each(function () {
                            // set decreased width to other headers
                            var nowW = (headerW - cumW) / colCount;
                            $(this).width(nowW);
                            runW += nowW;
                            if (k == 1) {
                              // absorb error for clearing
                              $(this).width(headerW - (cumW + runW));
                            }
                            k++;
                        });
                    }
                }
            });

            // bind a function to update lower widths
            $(this).on('resizestop', function () {
              left = false; // reset global hack for dir
              snapToPercents($(this).parent());
            });
        });

    });
}
