/*playlist.model = {
	playlist_server : "http://chi2016.ru/playlist/server/playlist.php",
	upload_server : "http://chi2016.ru/playlist/server/upload.php",
	remote : function(action, params, cb) {
	    //console.log("remote request", action, params);
	    params = params || {};
	    params.action = action;
	    $.post(this.playlist_server, params, function(data) {
	        //console.log(data);
	        data = JSON.parse(data);
	        //console.log("remote response", data);
	        cb(data);
	    });
	},
	actual_date : moment().format('YYYY-MM-DD'),
	latest_date : false,
	current_date : moment().format('YYYY-MM-DD'),
	top100year : +moment().format('YYYY') - 1,
	current_year : +moment().format('YYYY') - 1,
	storage : {},
	top100_storage : {},
	top10_storage : {},
	get : function(pl_date, cb) {
		if (this.storage[pl_date]) {
		 this.actual_date = pl_date;
		 cb({date: pl_date, list : this.storage[pl_date]});
		}
		else this.remote("current", {current_date : pl_date}, function(data) {
		  if (data.date) this.actual_date = data.date;
		  if (data.list) this.storage[data.date] = data.list;
		  cb(data);
		}.bind(this));
	},
	current : function(cb) {
		if (this.storage[this.current_date]) 
		{
			this.actual_date = this.current_date;
			cb({date: this.current_date, list : this.storage[this.current_date]});
		}
		else this.remote("current", {}, function(data) {
		  if (data.date) {
		  this.actual_date = data.date;
		  this.current_date = data.date;
		  }
		  if (data.list) this.storage[data.date] = data.list;
		  cb(data);
		}.bind(this));
	},
	latest : function(cb) {
		if (this.latest_date && this.storage[this.latest_date]) {
			this.actual_date = this.latest_date;
			cb({date: this.latest_date, list : this.storage[this.latest_date]});
		}
		else this.remote("latest", {}, function(data) {
		  if (data.date) {
		  	this.actual_date = data.date;
		  	this.latest_date = data.date;
		  }
		  if (data.list) this.storage[data.date] = data.list;
		  cb(data);
		}.bind(this));
	},
	next : function(pl_date, cb) {
		if (this.storage[this.next_date(pl_date)]) {
			this.actual_date = this.next_date(pl_date);
			cb({date: this.next_date(pl_date), list : this.storage[this.next_date(pl_date)]});
		}
		else this.remote("next", {pl_date : pl_date}, function(data) {
		  if (data.date) this.actual_date = data.date;
		  if (data.list) this.storage[data.date] = data.list;
		  cb(data);
		}.bind(this));
	},
	prev : function(pl_date, cb) {
	   if (this.storage[this.prev_date(pl_date)]) {
	   		this.actual_date = this.prev_date(pl_date);
	   		cb({date: this.prev_date(pl_date), list : this.storage[this.prev_date(pl_date)]});
	   	}
		else this.remote("prev", {pl_date : pl_date}, function(data) {
		  if (data.date) this.actual_date = data.date;
		  if (data.list) this.storage[data.date] = data.list;
		  cb(data);
		}.bind(this));
	},
	top100 : function(cb) {
		if (this.top100_storage[this.top100year]) {
			this.current_year = this.top100year;
			cb({year : this.top100year, list : this.top100_storage[this.top100year]});
		}
		else this.remote("top100", {year : this.top100year }, function(data) {
			if (data.year) this.current_year = this.top100year; else this.top100year = this.current_year;
			if (data.list) this.top100_storage[this.top100year] = data.list;
			cb(data);
		}.bind(this));
	},
	top10artists : function(cb) {
		if (this.top10_storage[this.top100year]) {
			this.current_year = this.top100year;
			cb({year : this.top100year, list : this.top10_storage[this.top100year]});
		}
		else this.remote("top10artists", {year : this.top100year }, function(data) {
			if (data.year) this.current_year = this.top100year; else this.top100year = this.current_year;
			if (data.list) this.top10_storage[this.top100year] = data.list;
			cb(data);
		}.bind(this));
	},
	delete_playlist : function(pl_date, password, cb) {
		this.remote("delete", { pl_date : pl_date, password : password }, function(data) {
			if (data.ok && this.storage[pl_date]) {
				delete this.storage[pl_date];
				if (this.top100_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")];
				if (this.top10_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")];
			}
			cb(data);
		}.bind(this));
	},
	prev_date : function(date) {
	   return moment(date, "YYYY-MM-DD").subtract(7, "days").format("YYYY-MM-DD");
	},
	next_date : function(date) {
	   return moment(date, "YYYY-MM-DD").add(7, "days").format("YYYY-MM-DD");
	},
	update_data : function(date) {
		if (moment(date, "YYYY-MM-DD").unix() > moment(this.latest_date, "YYYY-MM-DD").unix()) this.latest_date = date;
		if (moment(date, "YYYY-MM-DD").unix() <= moment().unix()) this.current_date = date;
		if (this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
		if (this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
	},
	getItemChange : function(item) {
		if (item.date_appear === this.actual_date) return 'new';
		if (this.storage[this.prev_date(this.actual_date)]) {
			var prev_item = this.getItemById(this.storage[this.prev_date(this.actual_date)], item.id);
			if (prev_item) {
				if (+item.score > +prev_item.score) return 'up';
				if (+item.score < +prev_item.score) return 'down';
			}
			return false;
		}
		else return false;
	},
	getItemById : function(list, id) {
	   for (var i=0; i< list.length; i++)
		 if (list[i].id == id) return list[i];
	   return false;
   }
};
*/

Vue.component('items-list', {
	props : ['title', 'list', 'score'],
	template : `<div>
					<div class="list-title">{{title}}</div>
					<list-item v-for="item in list" v-if="item.score == score" v-bind:item="item"></list-item>
				</div>`
});

Vue.component('list-item', {
	props : ['item'],
	template: `<div class="list-item">
	<div v-bind:class="['item-info', item.item_class ? item.item_class : '']"></div>
	<div class="item-main item-mr">
		<div class="artist" v-html="item.artist"></div>
		<div class="song" v-html="item.title"></div>
	</div>
</div>`
});

Vue.component('top-list-item', {
	props : ['item', 'num', 'mode'],
	template : `<div class="list-item">
	<div class="item-info top100">{{num + 1}}</div>
	<div class="item-main">
		<div class="artist" v-html="item.artist"></div>
		<div class="song" v-html="item.title"></div>
	</div>
	<div class="item-info total" v-if="mode=='top100'">{{item.total}}</div>
	<div class="item-info total" v-if="mode=='top10artists'">{{item.artist_total}}</div>
	<div class="item-info top100" v-if="mode=='top10artists'">{{item.songs}}</div>
</div>`
});

var playlist_app = new Vue({
	el : "#playlist-app",
	data : {
		playlist_server : "http://chi2016.ru/playlist/server/playlist.php",
		upload_server : "http://chi2016.ru/playlist/server/upload.php",
		actual_date : moment().format('YYYY-MM-DD'),
		latest_date : false,
		current_date : false,
		top100year : +moment().format('YYYY') - 1,
		current_year : +moment().format('YYYY') - 1,
		storage : {},
		top100_storage : {},
		top10_storage : {},
		loading : false,
		showLeftMenu : false,
		mode : 'main',
		years_array : [],
		is_mobile : false	
	},
	created : function() {
		 for (var y=this.top100year; y>=2007; y--)
			this.years_array.push(y);
	},
	computed: {
		playlist : function() {
			var plDate = this.actual_date.substring(0,10);
			console.log('playlist date', plDate, this.storage);
			if (!this.storage[plDate]) {
				this.loading = true;
				this.remote("current", {current_date : plDate}, function(data) {
					if (data.date) this.actual_date = data.date;
					if (data.list) this.setStorage(data.date, data.list);
					if (!this.current_date) this.current_date = this.actual_date;
					this.loading = false;
				}.bind(this));
				return [];
			};
			
			return this.storage[plDate];
		},
		
		top100data : function() { console.log(this.top100year);
			
			if (this.mode!="top100") return [];
			
			if (!this.top100_storage[this.top100year])
			{
				this.loading = true;
				this.remote("top100", {year : this.top100year }, function(data) {
					if (data.year) { this.top100year = ""; this.top100year = data.year; }
					if (data.list) this.top100_storage[this.top100year] = data.list;
					if (data.error) { 
						if (this.top100year > this.years_array[0]) this.top100year--;
						if (this.top100year < this.years_array[this.years_array.length - 1]) this.top100year++;
					}
					this.loading = false;
				}.bind(this));
				return [];
			}
			
			return this.top100_storage[this.top100year];
		},
		
		top10data : function() {
			if (this.mode!="top10artists") return [];
			
			if (!this.top10_storage[this.top100year])
			{
				this.loading = true;
				this.remote("top10artists", {year : this.top100year }, function(data) {
					if (data.year) { this.top100year = ""; this.top100year = data.year; }
					if (data.list) this.top10_storage[this.top100year] = data.list;
					if (data.error) { 
						if (this.top100year > this.years_array[0]) this.top100year--;
						if (this.top100year < this.years_array[this.years_array.length - 1]) this.top100year++;
					}
					this.loading = false;
				}.bind(this));
				return [];
			}
			
			return this.top10_storage[this.top100year];
		},
		
		actualDate : function() {
			return this.actual_date.substring(0,10);
		}
	},
	mounted : function() {
		window.addEventListener('resize', this.handleResize);
		this.handleResize();
		/*$('#pl_date').pl_calendar({
   	   	$button : $('.pl-calendar'),
   	   	yearRange : [2007,moment().format('YYYY')],
   	   	setDate : function(date) {
   	   		this.getPlaylist(date);
   	   	}.bind(this),
   	   	is_mobile : this.is_mobile
   	   }); */
   	   
   	   window.addEventListener('resize', this.handleResize);
   	   this.showLeftMenu = !this.is_mobile;
   	   window.addEventListener("drop",function(e){
		  e = e || event;
		  e.preventDefault();
		},false);
   	   
	},
	methods : {
		handleResize : function() {
			this.is_mobile = $(window).width() < 800;
		},
		remote : function(action, params, cb) {
			//console.log("remote request", action, params);
			this.loading = true;
			params = params || {};
			params.action = action;
			$.post(this.playlist_server, params, function(data) {
				console.log(data);
				data = JSON.parse(data);
				console.log("remote response", data);
				this.loading = false;
				cb(data);
			}.bind(this));
		},
		current : function() {
			this.mode = 'main';
			if (this.storage[this.current_date]) 
			{
				this.actual_date = this.current_date;
			}
			else this.remote("current", {}, function(data) {
			  if (data.date) {
				this.actual_date = data.date;
				this.current_date = data.date;
			  }
			  if (data.list) this.setStorage(data.date, data.list);
			}.bind(this));
		},
		latest : function() {
			this.mode = 'main';
			if (this.latest_date && this.storage[this.latest_date]) {
				this.actual_date = this.latest_date;
			}
			else this.remote("latest", {}, function(data) {
			  if (data.date) {
				this.actual_date = data.date;
				this.latest_date = data.date;
			  }
			  if (data.list) this.setStorage(data.date, data.list);
			}.bind(this));
		},
		archive: function(e) { console.log('e', e);
			this.$refs.picker.open(e);
		},
		next : function() {
			switch (this.mode) {
				case "main":
					if (this.storage[this.next_date(this.actualDate)]) {
					this.actual_date = this.next_date(this.actualDate);
					}
					else this.remote("next", {pl_date : this.actualDate}, function(data) {
					  if (data.date) this.actual_date = data.date;
					  if (data.list) this.setStorage(data.date, data.list);
					}.bind(this));
					break;
				 case "top100":
			     case "top10artists":
					this.top100year++; break;
			}
		},
		prev : function() {
		   switch (this.mode) {
			   case "main":
				   if (this.storage[this.prev_date(this.actualDate)]) {
					this.actual_date = this.prev_date(this.actualDate);
					}
					else this.remote("prev", {pl_date : this.actualDate}, function(data) {
					  if (data.date) this.actual_date = data.date;
					  if (data.list) this.setStorage(data.date, data.list);
					}.bind(this));
					break;
			   case "top100":
			   case "top10artists":
					this.top100year--; break;
		   }
		},
		move : function(direction) {
			var $pl_content = $('#playlist-content');
			var k = direction == "right" ? -1 : 1;
			var old_pos = { top: $pl_content.offset().top, left : $pl_content.offset().left };
			$pl_content.css({position: 'absolute', top: $pl_content.offset().top, left:$pl_content.offset().left });
			$pl_content.animate({
   	   		left: k * $(window).width()
   	   }, 300, function() { 
		   $pl_content.css({ position: 'relative', top : 0, left : 0}); 
		   if (direction == 'left') this.prev();
		   if (direction == 'right') this.next();
		   }.bind(this));
		
		},
		top100 : function() {
			this.mode = 'top100';
		},
		top10artists : function() {
			this.mode = 'top10artists';
		},
		openfile : function() {
			$('#pl_file').click();
		},
		changefile : function() {
			var file = this.$refs.pl_file.files[0];
			this.upload_file(file);
		},
		upload_file: function(file) {
			var reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = function(event) {
				var result = event.target.result;
				var fileName = file.name; 
				$.post(this.upload_server, { data: result, name: fileName }, function(data) {
					console.log('response data', data);
					data = JSON.parse(data);
					if (data.status == "ok" && data.pl_date) { this.update_data(data.pl_date); this.actual_date = data.pl_date; }
					else if (data.status == "error") this.showError(data.error);
					else this.showError("Error uploading playlist");
			}.bind(this));
			}.bind(this);
		},
		update_data : function(date) {
			if (moment(date, "YYYY-MM-DD").unix() > moment(this.latest_date, "YYYY-MM-DD").unix()) this.latest_date = date;
			if (moment(date, "YYYY-MM-DD").unix() <= moment().unix()) this.current_date = date;
			if (this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
			if (this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
		},
		delete_playlist : function(pl_date, password) {
			this.remote("delete", { pl_date : pl_date, password : password }, function(data) {
				if (data.ok && this.storage[pl_date]) {
					delete this.storage[pl_date];
					if (this.top100_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")];
					if (this.top10_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(pl_date, "YYYY-MM-DD").format("YYYY")];
				}
			}.bind(this));
		},
		prev_date : function(date) {
		   return moment(date, "YYYY-MM-DD").subtract(7, "days").format("YYYY-MM-DD");
		},
		next_date : function(date) {
		   return moment(date, "YYYY-MM-DD").add(7, "days").format("YYYY-MM-DD");
		},
		itemInfoClass : function(item) {
			if (item.date_appear === this.actual_date) return 'pl-new';
			if (this.storage[this.prev_date(this.actual_date)]) {
				var prev_item = this.getItemById(this.storage[this.prev_date(this.actual_date)], item.id);
				if (prev_item) {
					if (+item.score > +prev_item.score) return 'pl-up';
					if (+item.score < +prev_item.score) return 'pl-down';
				}
				return false;
			}
			else return false;
		},
		getItemById : function(list, id) {
		   for (var i=0; i< list.length; i++)
			 if (list[i].id == id) return list[i];
		   return false;
	   },
	   setStorage : function(date, list) {
			this.storage[date] = list;
			this.storage[date].forEach(function(item) {
				item.item_class = this.itemInfoClass(item);
			}.bind(this))
	   },
	   toggleLeftMenu : function() {
		this.showLeftMenu = !this.showLeftMenu;
	   },
	   showError : function() {
		   
	   }
	}
});
	         
