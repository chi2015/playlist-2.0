playlist.view = {
   init : function() {
   	   if ($(window).width() >= 800) this.toggleLeftMenu();
   	   this.$pl_content = $('#playlist-content');
   	   this.$main_block = $('.main-block');
   	   this.$pl_content.addClass("pl-loading");
   	   this.$pl_content.on('touchstart', this.contentTouchStart.bind(this));
   	   this.$pl_content.on('touchmove', this.contentTouchMove.bind(this));
   	   $('.lm-item').on('click', function() {if ($(window).width() < 800) this.toggleLeftMenu();}.bind(this));
   	   playlist.model.current(this.renderPlaylist.bind(this));
   	   $('#pl_date').pl_calendar({
   	   	$button : $('.pl-calendar'),
   	   	yearRange : [2007,2017],
   	   	setDate : function(date) {
   	   		this.get(date);
   	   	}.bind(this),
   	   	is_mobile : $(window).width() < 800
   	   }); 
   	   $('#pl_file').on('change', this.changefile.bind(this));
   	   
   	   var year_str = '';
   	   for (var y=2007; y<=playlist.model.top100year; y++)
   	   	year_str+= '<option value="'+y+'">'+y+'</option>';
   	   	$('#pl_year').html(year_str);
   	   	$('#pl_year').val(playlist.model.top100year);
   	   	$('#pl_year').on('change', this.changeYear.bind(this));
   	   	
   	   
   	   window.addEventListener("dragover", function(e) {
    e.preventDefault();
    this.dragoverMain(e);
}.bind(this));
window.addEventListener("mouseout", function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
        // stop your drag event here
        // for now we can just use an alert
        $('.pl-dragover').remove();
    }
}.bind(this));

window.addEventListener("drop", function(e) {
    e.preventDefault();
    this.dropMain(e);
}.bind(this));
   },
   renderLeftMenu : function() {
   
   },
   renderTop100 : function(data) {
   		this.mode = "top100";
   		$('#pl_date').hide();
        $('.pl-calendar').hide();
        $('#pl_year').show();
        $('#pl_year').val(data.year);
        var top100_str = '', i=1;
        this.$pl_content.removeClass("pl-loading");
        this.$pl_content.empty();
        data.list.forEach(function(item) {
     	top100_str+='<div class="list-item">'+
     	            '<div class="item-info top100">'+i+'</div>'+
     	            '<div class="item-main"><div class="artist">'+item.artist+'</div><div class="song">'+item.title+'</div></div>'+
     	            '<div class="item-info total">'+item.total+'</div>'+
     	            '</div>';
     	            i++;
     });
     this.$pl_content.append(top100_str);
   },
   renderTop10Artists : function(data) {
   	this.mode = "top10artists";
   	$('#pl_date').hide();
        $('.pl-calendar').hide();
        $('#pl_year').show();
        $('#pl_year').val(data.year);
        var top10_str = '', i=1;
        this.$pl_content.removeClass("pl-loading");
        this.$pl_content.empty();
        data.list.forEach(function(item) {
     	top10_str+='<div class="list-item">'+
     	            '<div class="item-info top100">'+i+'</div>'+
     	            '<div class="item-main"><div class="artist">'+item.artist+'</div></div>'+
     	            '<div class="item-info total">'+item.artist_total+'</div>'+
     	            '<div class="item-info top100">'+item.songs+'</div>'+
     	            '</div>';
     	            i++;
     });
     this.$pl_content.append(top10_str);
   },
   renderPlaylist : function(data) {
     this.mode = "main";
     $('#pl_year').hide();
     $('.pl-calendar').show();
     $('#pl_date').show();
     if (playlist.model.latest_date === data.date) $('#pl_next').hide();
     else $('#pl_next').show();
     $('#pl_date').val(this.formatDate(data.date));
     var alist_str = '', blist_str = '', clist_str = '';
     this.$pl_content.removeClass("pl-loading");
     this.$pl_content.empty();
     data.list.forEach(function(item) {
     	var item_change = playlist.model.getItemChange(item);
     	var item_str = '<div class="list-item">'+'<div class="item-info'+(playlist.view.getItemInfoClass(item_change))+'"></div>'+
     	'<div class="item-main"><div class="artist">'+item.artist+'</div><div class="song">'+item.title+'</div></div></div>';
     	switch (+item.score) {
     	   case 47: alist_str += item_str; break;
     	   case 28: blist_str += item_str; break;
     	   case 23: clist_str += item_str; break;
     	}
     });
     
     this.$pl_content.append('<div class="list-title">A List</div>'
                        +alist_str+'<div class="list-title">B List</div>'
                        +blist_str+'<div class="list-title">C List</div>'
                        +clist_str);
     
   },
   mode : "main",
   get : function(pl_date) {
   	this.$pl_content.empty();
   	this.$pl_content.addClass("pl-loading");
   	playlist.model.get(pl_date, this.renderPlaylist.bind(this));
   },
   current : function() {
   	   this.$pl_content.empty();
   	   this.$pl_content.addClass("pl-loading");
   	   playlist.model.current(this.renderPlaylist.bind(this));
   },
   latest : function() {
       this.$pl_content.empty();
       this.$pl_content.addClass("pl-loading");
       playlist.model.latest(this.renderPlaylist.bind(this));
   },
   next : function() {
   	   this.$pl_content.empty();
   	   this.$pl_content.addClass("pl-loading");
   	   switch (this.mode) {
   	   	case "main": playlist.model.next(playlist.model.actual_date, this.renderPlaylist.bind(this)); break;
   	   	case "top100": playlist.model.top100year++; this.top100(); break;
   	   	case "top10artists": playlist.model.top100year++; this.top10artists(); break;
   	   }
   	   
   },
   prev : function() {
       this.$pl_content.empty();
       this.$pl_content.addClass("pl-loading");
       switch (this.mode) {
   	   	case "main": playlist.model.prev(playlist.model.actual_date, this.renderPlaylist.bind(this)); break;
   	   	case "top100": playlist.model.top100year--; this.top100(); break;
   	   	case "top10artists": playlist.model.top100year--; this.top10artists(); break;
   	   }
   },
   openfile : function() {
   	$('#pl_file').click();
   },
   changefile : function() {
   	var file = document.getElementById('pl_file').files[0];
   	this.upload(file);
   },
   upload : function(file) {
	var reader = new FileReader();
	reader.readAsText(file, 'UTF-8');
	reader.onload = function(event) {
		var result = event.target.result;
    	var fileName = file.name; 
    	$.post(playlist.model.upload_server, { data: result, name: fileName }, function(data) {
    		data = JSON.parse(data);
    		if (data.status == "ok" && data.pl_date) this.get(data.pl_date);
    		else if (data.status == "error") this.showError(data.error);
    		else this.showError("Error uploading playlist");
    	}.bind(this));
	}.bind(this);
   },
   top100 : function() {
   	 this.$pl_content.empty();
   	 this.$pl_content.addClass("pl-loading");
   	 playlist.model.top100(this.renderTop100.bind(this));
   },
   top10artists : function() {
   	 this.$pl_content.empty();
   	 this.$pl_content.addClass("pl-loading");
   	 playlist.model.top10artists(this.renderTop10Artists.bind(this));
   },
   getItemInfoClass : function(change) {
		switch (change) {
			case 'new': return ' pl-new';
			case 'up': return ' pl-up';
			case 'down': return ' pl-down';
			default: return '';
		}
		
		return '';
   },
   contentTouchStart : function(e) {
	this.xDown = e.touches[0].clientX;
	this.yDown = e.touches[0].clientY;
   },
   contentTouchMove : function(e) {
	   if ( ! this.xDown || ! this.yDown ) {
        			return;
    		}

    			var xUp = e.touches[0].clientX;                                    
    			var yUp = e.touches[0].clientY;

    			var xDiff = this.xDown - xUp;
    			var yDiff = this.yDown - yUp;

    			if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        			if ( xDiff > 0 ) {
            			/* left swipe */ 
            			this.next();
        			} else {
            			/* right swipe */
            			this.prev();
        			}                       
    			} else {
        			if ( yDiff > 0 ) {
            			/* up swipe */
        			} else { 
            			/* down swipe */
        			}                                                                 
    			}
   			 /* reset values */
    		this.xDown = null;
    		this.yDown = null;
   },
   toggleLeftMenu : function() {
   		if (!this.lm_hidden) $('.left-menu').addClass('vh-menu');
   		else $('.left-menu').removeClass('vh-menu');
   		this.lm_hidden = !this.lm_hidden;
   },
   lm_hidden: true,
   formatDate : function(pl_date) {
   		var month = moment.months()[moment(pl_date, "YYYY-MM-DD").get('month')];
   		if ($(window).width() < 800) month = month.substr(0,3);
   		var day = moment(pl_date, "YYYY-MM-DD").get('date');
   		var day_suffix = '';
   		if ($(window).width() >= 800)
   		{
   		switch (day) 
   		{
   			case 1:
   			case 21:
   			case 31: day_suffix = 'st'; break;
   			case 2:
   			case 22: day_suffix = 'nd'; break;
   			case 3: day_suffix = 'rd'; break;
   			default: day_suffix = 'th'; break;
   		}
   		}
   		return day+day_suffix+' '+month+' '+moment(pl_date, "YYYY-MM-DD").get('year');
   },
   dragoverMain : function(e) {
   	console.log($(e.target));
   	if (!$('.pl-dragover').length) $('body').append('<div class="pl-dragover"></div>');
   },
   dropMain : function(e) {
   		$('.pl-dragover').remove();
   		var file = e.dataTransfer.files[0];
   		this.upload(file);
   },
   changeYear : function() {
   		var year = $('#pl_year').val();
   		if (this.mode=="top100") {
   		playlist.model.top100year = year;
   		this.top100();
   		}
   		if (this.mode == "top10artists") {
   		playlist.model.top100year = year;
   		this.top10artists();
   		}
   },
   showError : function(error_text) {
   		alert(error_text);
   }
};
