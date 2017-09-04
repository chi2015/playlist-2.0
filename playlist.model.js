playlist.model = {
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
	         
