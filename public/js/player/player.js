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

var audioPlayer = new Audio();
//Just did this cause the other guy did it, seems like its kew
audioPlayer.crossOrigin = "anonymous"
//audioPlayer.play();

//Set up our pause/play button to use the play button Icon initially
$('#pauseplay').css('background-image', playIcon);

//Tie our pauseplay button to the "play" and "pause" events from the player
/*
audioPlayer.on('play', function () {
    $('#pauseplay').css('background-image', pauseIcon);
});
audioPlayer.on('pause', function () {
    $('#pauseplay').css('background-image', playIcon);
});
*/

//Tie out pause/play button to the "player" objects pause / play functions
var currtimems = 0;
$(audioPlayer).on('timeupdate', function () {
    currtimems = audioPlayer.currentTime*1000.0;
});

//Tie our pauseplay button to the "play" and "pause" events from the player
$(audioPlayer).on('play', function () {
    $('#pauseplay').css('background-image', pauseIcon);
});
$(audioPlayer).on('pause', function () {
    $('#pauseplay').css('background-image', playIcon);
});

$('#artworkimg').click(function (e) {
    if (isPlaying && !audioPlayer.paused) {
        audioPlayer.pause();
        isPlaying = false;
        $('#pauseplay').css('background-image', playIcon);
    } else {
        // TODO stop reseting pos on play somehow
        $('#pauseplay').css('background-image', pauseIcon);

        var pos = $('#back-div').width();
        var width = $('#waveformimg').width();
        var relativePercent = pos / (width * 1.0);
        var seekPosition = Math.round(duration * relativePercent);

        audioPlayer.play();
        isPlaying = true;
    }
});

$('#player').click(function (e) {
    //how far you clicked into the div's width by percent. 1.0 is to cast to double
    var relativePercent = e.pageX / ($(window).width() * 1.0);
    console.log(relativePercent + '%');
    var seekPosition = Math.round(duration * relativePercent);
    console.log("seekpos: " + seekPosition);
    audioPlayer.currentTime = seekPosition/1000.0;
});


function loadSong(track) {
    var trackid = track.t.properties.scid;
    var durationms = track.t.properties.duration;
    var artworkurl = track.t.properties.artwork_url;
    var waveformurl = track.t.properties.waveform_url;

    audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
    audioPlayer.load();
    audioPlayer.play();

    console.log(track);

    $(".track-title").text(track.t.properties.name);
    $(".track-channel").text(track.c.properties.name);

    duration = durationms;
    console.log('http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0');
            //Reset isPlaying boolean, change the
            isPlaying = true;
            $('#pauseplay').css('background-image', pauseIcon);

            //load in name
            $('.track-title').text(name);

            //Load artwork image to DOM
            $('#artworkimg').css('background-image', "url(" + artworkurl + ")");
            $('#art-bk').css('background-image', "url(" + artworkurl + ")");

            //expand the player
            $('#player').addClass('playing');

            //TODO, (maybe, or just have a func that passes these params, ajax can call that func) grab the duration from the backend like we do client_id above, that is how we calculate how much of the song has been listened to. wtf why isn't there a better way...
            //TODO (sames) grab the waveform url from backend like above

            // Moving art background animation
            var seconds = Math.round((duration/1000)* 1.0) + 's';
            jQuery('#art-bk').removeClass('moving');
            jQuery('#art-bk').css('transition', 'background-position ' + seconds
                    + ' linear');
            jQuery('#art-bk').addClass('moving');
            // player.on('time', function(){console.log("pos: " : this.position);});
            // soundPlayer = sound;
            // html5Audio = sound._player._html5Audio;
            // html5Audio.addEventListener('ended', function(){ console.log('event fired: ended'); });
}


function nextSong(){
    var track = queue.shift();
    backqueue.enshift(track);
    loadSong(track);
}

function previousSong(){
    var track = backqueue.shift();
    queue.enshift(track);
    loadSong(track);
}

// used to track resize direction

var left = false;

function snapToPercents(parentEl) {
  var parWid = parentEl.width();
  var colCt = parentEl.children().length;
  var catchAdd = 0;
  var j = 0;
  parentEl.children('li').each(function () {
    // iterate through li + siblings
    var eachC = "." + $(this).find('a').attr('also-resize');
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

function nextListener() {
  // autoplay!
  // hack to detect when song is over:
  // listen for the width of the progress bar
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutationRecord) {
      //console.log(mutationRecord.target.style.width);
      var completionPer = mutationRecord.target.style.width;

      // move the image background, since we're already listening
        if( completionPer == "100%") {

          if (queue.length == 0){
            var track = autoqueue.shift();
            loadSong(track);
          }
          else {
            var track = autoqueue.shift();
            loadSong(track);
          }

        }
    });
  });

  var target = document.getElementById('back-div');
  observer.observe(target, { attributes : true, attributeFilter : ['style'] });
}

var toggledLib = false;
function toggleLib() {
  if (!toggledLib) $('body').addClass('toggled');
  else $('body').removeClass('toggled');
  toggledLib = !toggledLib;
}
