function addCollection(){
	var url = "http://localhost:3000/api/collections/add";

	$.post(url, {}, function(result){
		console.log(result);
	})
};