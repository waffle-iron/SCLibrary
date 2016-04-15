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

//$('#artwrapper').append('<img src="https://i1.sndcdn.com/artworks-000147686094-b317ov-large.jpg"/>');

//to use the extendable player library put this in the html
//	<a href="http://soundcloud.com/matas/hobnotropic" class="sc-player">My new dub track</a>
//but has MIT license lel

// stream track id 293
//http://www.schillmania.com/projects/soundmanager2/doc for "soundmanager" docs aka the palyer object
//for waveforms MAYBE use this library (mit license = we have to share source?): http://www.waveformjs.org/
//use waveform_url to get the waveform
//for waveform stuff check out:
//http://www.waveformjs.org/#examples
function loadSong(trackid, durationms, artworkurl, waveformurl){

                    console.log(queue.getLength());
  SC.stream('/tracks/' + trackid, smOptions).then(function(player){

    //Reset all remnants of the last song player
    if(lastPlayer){
      //console.log(lastPlayer._isPlaying);
      if(lastPlayer.isPlaying()){ 
        lastPlayer.pause(); 
        isPlaying = false;
        lastPlayer.dispose();
      }
    }
    //Reset isPlaying boolean, change the 
    isPlaying = false;
    $('#pauseplay').attr('src', '../../images/playbutton.png');
    //$('#seekicon').css("left", "0%");
    $('#seekicon').css("width", "0%");

    //Load artwork image to DOM
    $('#artworkimg').attr('src', artworkurl);
    //Load waveform image to DOM
    $('#waveformimg').attr('src', waveformurl);
    $('#waveformimg').on('load', function(){
        var tempH =  $('#waveformimg').height();
        var tempW =  $('#waveformimg').width();
        $('#seekbarwrapper').css('height', tempH.toString() + "px");
        $('#seekbarwrapper').css('width', tempW.toString() + "px");
    });
      
    // resize function to keep the waveform
    // stuck to the loading background
    $(window).on('resize', function(){
        var thisH = $('#waveformimg').height();
        var thisW = $('#waveformimg').width();
        $('#seekbarwrapper').css('height', thisH.toString() + "px");
        $('#seekbarwrapper').css('width', thisW.toString() + "px");
    });

    lastPlayer = player;
    //console.log(lastPlayer);
    var duration = durationms;

    //Tie our pauseplay button to the "play" and "pause" events from the player
    player.on('play', function(){
        $('#pauseplay').attr('src', '../../images/pausebutton.png');
    });
    player.on('pause', function(){
        $('#pauseplay').attr('src', '../../images/playbutton.png');
    });
    
    //Auto play song
    player.play(); 
    isPlaying = true;
    //Tie out pause/play button to the "player" objects pause / play functions
    $('#pauseplaywrapper').unbind('click').click(function(e){
    	console.log('pauseplay clicked');
    	if(isPlaying && player.isPlaying()){
    		player.pause(); 
        isPlaying = false;
    	}
    	else{
    		player.play(); 
        isPlaying = true;
    	}
    });

    $('#player').unbind('click').click( function(e){
    	//how offset the current element is from the x=0 axis
    	var offset = $(this).offset();
    	var width = $('#waveformimg').width();
    	//relativeOffset = how far into the div's width you clicked in pixels
    	var relativeOffset = e.pageX - offset.left - 30;
      console.log(e.pageX - offset.left + "x");
      //how far you clicked into the div's width by percent. 1.0 is to cast to double
      var relativePercent = relativeOffset/(width*1.0);
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
          var percentPlayed = Math.floor((player.currentTime()/duration) * 10000)/100;
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
  function(reason){
    console.log(reason);
    console.log(player);
  });
}