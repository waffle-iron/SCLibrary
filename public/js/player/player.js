console.log("hi");
console.log(test + " + client_id: " + client_id);

SC.initialize({
  client_id: client_id
});

//make this autoplay, or make it so sometimes it will
var smOptions = {
    useHTML5Audio: true,
    preferFlash: false
};

var isPlaying = false;

$('#artwrapper').append('<img src="https://i1.sndcdn.com/artworks-000147686094-b317ov-large.jpg"/>');

//to use the extendable player library put this in the html
//	<a href="http://soundcloud.com/matas/hobnotropic" class="sc-player">My new dub track</a>
//but has MIT license lel

// stream track id 293
//http://www.schillmania.com/projects/soundmanager2/doc for "soundmanager" docs aka the palyer object
//for waveforms MAYBE use this library (mit license = we have to share source?): http://www.waveformjs.org/
//use waveform_url to get the waveform

//for waveform stuff check out:
//http://www.waveformjs.org/#examples
SC.stream('/tracks/247733771', smOptions).then(function(player){
  var duration = 202389;

  //Tie out pause/play button to the "player" objects pause / play functions
  $('#pauseplaywrapper').click(function(e){
  	console.log('pauseplay clicked');
  	if(isPlaying){
  		player.pause();
  	}
  	else{
  		player.play();
  	}
  });

  //Tie our pauseplay button to the "play" and "pause" events from the player
  player.on('play', function(){
  		$('#pauseplay').attr('src', '../../images/pausebutton.png');
  		isPlaying = true;
  });
  player.on('pause', function(){
  		$('#pauseplay').attr('src', '../../images/playbutton.png');
  		isPlaying = false;
  });

  $('#seekbarwrapper').click(function(e){
  	//how offset the current element is from the x=0 axis
  	var offset = $(this).offset();
  	var width = $('#seekbarwrapper').width();
  	//relativeOffset = how far into the div's width you clicked in pixels
  	var relativeOffset = e.pageX - offset.left;
    console.log(e.pageX - offset.left + "x");
    //how far you clicked into the div's width by percent. 1.0 is to cast to double
    var relativePercent = relativeOffset/(width*1.0);
    console.log(relativePercent*100+"%");
    //position in miliseconds of total song
    var seekPosition = Math.round(duration * relativePercent);
    console.log("seekpos: " + seekPosition);
    player.seek(seekPosition);
  });
  //player.on('time', function(){console.log("pos: " : this.position);});
  //TODO, (maybe, or just have a func that passes these params, ajax can call that func) grab the duration from the backend like we do client_id above, that is how we calculate how much of the song has been listened to. wtf why isn't there a better way...
  //TODO (sames) grab the waveform url from backend like above
  player.on('time', function () {
        //Get rid of all decimal points except first 2
        var percentPlayed = Math.floor((player.currentTime()/duration) * 10000)/100;
        console.log(percentPlayed + "% played");
        $('#seekicon').css("left", percentPlayed.toString() + "%");
    });
  //soundPlayer = sound;
    //html5Audio = sound._player._html5Audio;
    //html5Audio.addEventListener('ended', function(){ console.log('event fired: ended'); });
});