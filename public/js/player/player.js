
var isPlaying = false;

var playIcon = 'url(../../images/sc_icons/play.svg)';
var pauseIcon = 'url(../../images/sc_icons/pause.svg)';

var options = {
  refresh_rate: 15,
  bucket_size:13,
  wf_percent: 96,
  bar_width: 75,
  wf_detail: 12500,
  bar_thickness: 0.05,
  bar_height: 0.7,
  bar_height_2: 1.20,
  bar_y_offset: 11.5
};

var audioPlayer = new Audio();
//Just did this cause the other guy did it, seems like its kew
audioPlayer.crossOrigin = "anonymous";

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
var amplitude = 0;
var durationms = 1;
//Tie out pause/play button to the "player" objects pause / play functions

var currtimems = 0;
$(audioPlayer).on('timeupdate', function() {
    currtimems = audioPlayer.currentTime * 1000.0;
});

var details = [];
var percent = 0;

setInterval(function () {
    currtimems = audioPlayer.currentTime*1000.0;
    if (details){
      percent = currtimems / durationms;
      if (details.length > 0){
        amplitude = details[Math.round(percent * details.length)];
        waveform();
      }
    }
}, options.refresh_rate);

// This needs to be changed to listen for window size changes.
var window_width = 10;
setInterval(function () {
  window_width = Math.round($(window).width() / options.bar_width);
}, 1000);

//Tie our pauseplay button to the "play" and "pause" events from the player
$(audioPlayer).on('play', function() {
    $('#pauseplay').css('background-image', pauseIcon);
});
$(audioPlayer).on('pause', function() {
    $('#pauseplay').css('background-image', playIcon);
});

$('#artworkimg').click(function(e) {
  // e.preventDefault();
    if (isPlaying && !audioPlayer.paused) {
        audioPlayer.pause();
        isPlaying = false;
        $('#pauseplay').css('background-image', playIcon);
        bgScroll(false);
    } else {
        // TODO stop reseting pos on play somehow
        $('#pauseplay').css('background-image', pauseIcon);
        bgScroll(true);
        audioPlayer.play();
        isPlaying = true;
    }
});

$('#back-div').click(function(e) {
    //how far you clicked into the div's width by percent. 1.0 is to cast to double
    var relativePercent = e.pageX / ($(window).width() * 1.0);
    console.log(relativePercent + '%');
    var seekPosition = Math.round(duration * relativePercent);
    bgScroll(true, seekPosition/1000, duration/1000);
    console.log("seekpos: " + seekPosition);
    audioPlayer.currentTime = seekPosition / 1000.0;
    audioPlayer.play();
    isPlaying = true;
});

// made this global to help with next load
var durationms;
function loadSong(track) {
  console.log(track);
    var trackid = track.t.properties.scid;
    durationms = track.t.properties.duration;
    var artworkurl = track.t.properties.artwork_url;
    var waveformurl = track.t.properties.waveform_url;

    audioPlayer.src = 'http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0';
    audioPlayer.load();
    audioPlayer.play();
    loadWaveform(track.t._id);

    $(".track-title").text(track.t.properties.name);
    $(".track-channel").text(track.c.properties.name);

    duration = durationms;
    console.log('http://api.soundcloud.com/tracks/' + trackid + '/stream' + '?client_id=a3629314a336fd5ed371ff0f3e46d4d0');
    //Reset isPlaying boolean, change the
    isPlaying = true;
    $('#pauseplay').css('background-image', pauseIcon);

    //Load artwork image to DOM
    $('#artworkimg').css('background-image', "url(" + artworkurl + ")");
    $('#art-bk').css('background-image', "url(" + artworkurl + ")");

    //expand the player
    $('#player').addClass('playing');

    //TODO, (maybe, or just have a func that passes these params, ajax can call that func) grab the duration from the backend like we do client_id above, that is how we calculate how much of the song has been listened to. wtf why isn't there a better way...
    //TODO (sames) grab the waveform url from backend like above

    var seconds = Math.round((duration / 1000) * 1.0);
    bgScroll(true, 0, seconds); // start bg scrolling
}

audioPlayer.addEventListener("ended", nextSong);

var normal = [];

function loadWaveform(track_id){
    d3.json("/api/track/waveform/" + track_id, function(error, data1){
      if (error) throw error;

      normal = data1;

      details = interpolateArray(data1, options.wf_detail);
    });
}


function waveform(){

    document.getElementById('wf_box').innerHTML = "";

    var data1 = normal;

    var height = "210px";
    var width = "" + options.wf_percent + "%";
    var data = [];

    var b = 33 - window_width;

    data.push(data1[0]);
    data.push(data1[4]);
    for (var i = 1; i < data1.length/b; i++){
      var total = 0;
      for (var j = 0; j < b; j++){
        total +=  data1[(i * b) + j];
      }
      if (Math.round(total/b))
        data.push(Math.round(total/b));
    }

    var w = options.bar_height_2 * (6 - 10 / window_width), h = d3.max(data) * 2;

    var chart = d3.select(".charts").append("svg")
      .attr("class", "chart")
      .attr("width", width)
      .attr("style", "padding-left:" + (100 - options.wf_percent) + "%;")
      .attr("viewBox", "0 0 " + Math.max(w * data.length, 0) + " " + h )
      .attr("fill", "white");
      //TODO: Make a color analyzer for album artwork so that we can use a pallette to color things in the player, like fill.

    var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, w]);

    var y = d3.scale.linear()
      .domain([0, h])
      .rangeRound([0, h]); //rangeRound is used for antialiasing

    var thickness = (amplitude / 150) - 0.4;

    chart.selectAll("rect")
      .data(data)
    .enter().append("rect")
      .attr("x", function(d, i) { return x(i) - Math.max(w * thickness * d / 100 - 0.25, 0.3)/2; })
      .attr("y", function(d) { return (h - (y(d * options.bar_height) * amplitude / h)) })
      .attr("width", function(d) { return Math.max((w * thickness * d / 100 - 0.25) + (w * thickness) / 2.5, 0.2)})
      .attr("height", function(d) { return Math.max((y(d * options.bar_height) * amplitude / h) + options.bar_y_offset, 0); });

}

var lastShift = 0.0;
function bgScroll(play, pos, dur) {
    element = document.getElementById("art-bk");
    var bkDiv = jQuery('#art-bk'),
        shiftOff = (dur - pos), // distance from the end in seconds
        perShift = Math.round(pos / dur * 100.0), // percentage
        computedStyle = window.getComputedStyle(element),
        backgroundPer = computedStyle.getPropertyValue('background-position-y');

    // bkDiv.removeClass('moving'); // stop the moving
    element.classList.remove("moving");
    console.log(dur + ' ' + pos + ' ' + play + ' ' + perShift + '+');

    // set new position as percentage
    if (dur) {
      bkDiv.css('background-position-y', perShift + '%');
      lastShift = shiftOff;
    } else {
      bkDiv.css('background-position-y', backgroundPer + '%');
    }

    if (play) {
        // set/reset transition to time remaining
        bkDiv.css('transition', 'none');
        if (dur) {
          window.setTimeout( function() {
            element.classList.add("moving");
            bkDiv.css('transition', 'background-position ' +
                shiftOff + 's linear');
          }, 40);
        } else {
          element.classList.add("moving");
          bkDiv.css('transition', 'background-position ' +
              lastShift + 's linear');
        }

    } else {
        bkDiv.css('background-position-y', backgroundPer);
    }
}

function nextSong() {
    if (queue.length > 0)
      var track = queue.shift();
    else
      var track = autoqueue.shift();

    backqueue.unshift(track);
    loadSong(track);
}

function previousSong() {
    var track = backqueue.shift();
    queue.unshift(track);
    loadSong(track);
}

// used to track resize direction

var left = false;

function snapToPercents(parentEl) {
    var parWid = parentEl.width();
    var colCt = parentEl.children().length;
    var catchAdd = 0;
    var j = 0;
    parentEl.children('li').each(function() {
        // iterate through li + siblings
        var eachC = "." + $(this).find('a').attr('also-resize');
        if (j == colCt - 1) {
            // force clearing
            var catchAll = 100.0 - catchAdd;
            //console.log(catchAdd + " + " + catchAll);
            $(this).css('width', catchAll.toString() + "%");
        } else {
            var perW = ($(this).width() / parWid) * 100;
            $(this).css('width', perW.toString() + "%");
            //console.log(j + " - " + perW.toString() + "%");
            catchAdd += perW;
        }
        // resize col's below
        $(eachC).each(function() {
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
    $('.col-sizeable').each(function() {
        // multiple loops and class vs id
        $(this).children('li').each(function() {
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

                resize: function(event, ui) {
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
                    var cumW;
                    var colCount;
                    // behaviour varies by drag side
                    if (!left) {
                        colCount = $(this).nextAll('li').length;
                        cumW = 0;
                        $(this).prevAll().each(function() {
                            // sum col widths to the left
                            cumW += $(this).width();
                        });
                        cumW += $(this).width();
                        $(this).nextAll().each(function() {
                            // set decreased width to other headers
                            $(this).width(((headerW - cumW) / colCount) - 5);
                        });
                    } else {
                        // left-side drag
                        colCount = $(this).prevAll().length;
                        cumW = 0;
                        $(this).nextAll().each(function() {
                            // sum col widths to the right
                            // round to assist clearing
                            cumW += $(this).width();
                        });
                        cumW += $(this).width();

                        var k = 0;
                        var runW = 0;
                        $(this).prevAll().each(function() {
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
            $(this).on('resizestop', function() {
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

            var completionPer = mutationRecord.target.style.width;

            // move the image background, since we're already listening
            if (completionPer == "100%") {
                var track;
                if (queue.length === 0) {
                    track = autoqueue.shift();
                    loadSong(track);
                } else {
                    track = autoqueue.shift();
                    loadSong(track);
                }

            }
        });
    });

    var target = document.getElementById('back-div');
    observer.observe(target, {
        attributes: true,
        attributeFilter: ['style']
    });
}

var toggledLib = false;

function toggleLib() {
    if (!toggledLib) $('body').addClass('toggled');
    else $('body').removeClass('toggled');
    toggledLib = !toggledLib;
}
var toggledSet = false;
function toggleSet() {
  if (!toggledSet) $('#settings').addClass('toggled');
  else $('#settings').removeClass('toggled');
  toggledSet = !toggledSet;
}
var toggledAuto = true;
function toggleAuto() {
  if (!toggledAuto) $('#autoplay-toggle').addClass('toggled');
  else $('#autoplay-toggle').removeClass('toggled');
  toggledAuto = !toggledAuto;
}
var toggledShuffle = false;
function toggleShuffle() {
  if (!toggledShuffle) $('#shuffle-toggle').addClass('toggled');
  else $('#shuffle-toggle').removeClass('toggled');
  toggledShuffle = !toggledShuffle;
}

function linearInterpolate(before, after, atPoint) {
  return before + (after - before) * atPoint;
}

function interpolateArray(data, fitCount) {
  var newData = new Array();
  var springFactor = new Number((data.length - 1) / (fitCount - 1));
  newData[0] = data[0]; // for new allocation
  for ( var i = 1; i < fitCount - 1; i++) {
    var tmp = i * springFactor;
    var before = new Number(Math.floor(tmp)).toFixed();
    var after = new Number(Math.ceil(tmp)).toFixed();
    var atPoint = tmp - before;
    newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
    }
  newData[fitCount - 1] = data[data.length - 1]; // for new allocation
  return newData;
}
