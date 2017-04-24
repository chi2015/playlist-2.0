playlist.view = {
   init : function() {
   	   if ($(window).width() >= 800) this.toggleLeftMenu();
   	   this.$pl_content = $('#playlist-content');
   	   this.$pl_content.addClass("pl-loading");
   	   this.$pl_content.on('touchstart', this.contentTouchStart.bind(this));
   	   this.$pl_content.on('touchmove', this.contentTouchMove.bind(this));
   	   $('.lm-item').on('click', this.toggleLeftMenu.bind(this));
   	   playlist.model.current(this.renderPlaylist.bind(this));
   	   $('#pl_date').pl_calendar({
   	   	$button : $('.pl-calendar'),
   	   	yearRange : [2005,2017],
   	   	setDate : function(date) {
   	   		this.get(date);
   	   	}.bind(this),
   	   	is_mobile : $(window).width() < 800
   	   }); 
   },
   renderLeftMenu : function() {
   
   },
   renderPlaylist : function(data) {
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
   	   playlist.model.next(playlist.model.actual_date, this.renderPlaylist.bind(this));
   },
   prev : function() {
       this.$pl_content.empty();
       this.$pl_content.addClass("pl-loading");
       playlist.model.prev(playlist.model.actual_date, this.renderPlaylist.bind(this));
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
   }
};
