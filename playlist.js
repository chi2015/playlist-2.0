Vue.component('playlist', {
	props: ['list'],
	template : '#playlist'
});

Vue.component('sublist', {
	props : ['title', 'list', 'score'],
	template : '#sublist'
});

Vue.component('song', {
	props : ['item', 'mode', 'num'],
	template: '#song'
});

Vue.component('modal', {
	template: '#modal-template',
	props: ['show', 'confirmdelete', 'errortxt', 'actualdate', 'deletepassword'],
	methods: {
	  close: function () {
		this.$emit('close');
	  },
	  deletePlaylist: function() {
		this.$emit('delete', this.actualdate, this.deletepassword);
		this.$emit('close');
	  }
	}
  });

var playlist_app = new Vue({
	el : "#playlist-app",
	data : {
		playlist_server : "http://chi2016.ru/playlist/server/playlist.php",
		upload_server : "http://chi2016.ru/playlist/server/upload.php",
		actual_date : false,
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
		is_mobile : false,
		showModal : false,
		errorTxt : false,
		confirmDelete: false,
		dragover : false
	},
	watch : {
		actual_date : function() {
			if (!this.storage[this.actualDate]) { 
				this.loading = true;
				this.remote("current", {current_date : this.actualDate}, function(data) {
					if (data.date) { this.actual_date = "", this.actual_date = data.date; }
					if (data.list) this.setStorage(data.date, data.list);
					if (!this.current_date) this.current_date = this.actual_date;
					if (data.error) this.showError(data.error);
					this.loading = false;
				}.bind(this));
			}
		},
		top100year : function() {
			this.checkTopStorage();
		},
		mode : function() {
			if (this.mode!="main") this.checkTopStorage();
		}
	},
	created : function() {
		 for (var y=this.current_year+1; y>=2007; y--)
			this.years_array.push(y);
		this.actual_date = moment().format('YYYY-MM-DD');
	},
	computed: {		
		actualDate : function() {
			return this.actual_date.substring(0,10);
		}
	},
	mounted : function() {
	  window.addEventListener('resize', this.handleResize);
	  this.handleResize();
	  this.showLeftMenu = !this.is_mobile;
	  this.initDragAndDropEvents();
	},
	methods : {
		handleResize : function() {
			this.is_mobile = $(window).width() < 800;
		},
		initDragAndDropEvents : function() {
			let playlistContent = document.getElementById('playlist-content');
			let self = this;
			['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
				playlistContent.addEventListener(eventName, preventDefaults, false);
			  })
			  function preventDefaults (e) {
				e.preventDefault();
				e.stopPropagation();
			  }
			
			  ['dragenter', 'dragover'].forEach(eventName => {
				playlistContent.addEventListener(eventName, highlight, false);
			  })
			  ;['dragleave', 'drop'].forEach(eventName => {
				playlistContent.addEventListener(eventName, unhighlight, false);
			  })
			  function highlight(e) {
				playlistContent.classList.add('pl-dragover-new');
				self.dragover = true;
			  }
			  function unhighlight(e) {
				playlistContent.classList.remove('pl-dragover-new');
				self.dragover = false;
			  }

			  playlistContent.addEventListener('drop', handleDrop, false);

			  function handleDrop(e) {
				  let dt = e.dataTransfer;
				  let files = dt.files;
				  if (files.length > 0) self.upload_file(files[0]);
			  }
			  
		},
		remote : function(action, params, cb) {
			this.loading = true;
			params = params || {};
			params.action = action;
			console.log("req body", JSON.stringify(params));
			fetch(this.playlist_server,
			{
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(params)
			})
			.then((res) => { return res.json(); })
			.then((data) => { console.log( "FETCH remote response", data  );
				this.loading = false;
				cb(data);
			});
		},
		checkTopStorage : function() {
			var data_storage;
			if (this.mode=="top100") data_storage = this.top100_storage;
			if (this.mode=="top10artists") data_storage = this.top10_storage;
			if (!data_storage[this.top100year]) {
				this.loading = true;
				this.remote(this.mode, {year : this.top100year }, function(data) {
					if (data.year) { this.top100year = ""; this.top100year = data.year; }
					if (data.list) data_storage[this.top100year] = data.list;
					if (data.error) { 
						if (this.top100year > this.years_array[0]) this.top100year--;
						if (this.top100year < this.years_array[this.years_array.length - 1]) this.top100year++;
					}
					if (data.error) this.showError(data.error);
					this.loading = false;
				}.bind(this));
			}
		},
		setPlaylistData : function(data) {
			if (data.date) this.actual_date = data.date;
			if (data.list) this.setStorage(data.date, data.list);
			if (data.error) this.showError(data.error);
		},
		current : function() {
			this.mode = 'main';
			if (this.storage[this.current_date]) 
			{
				this.actual_date = this.current_date;
			}
			else this.remote("current", {}, function(data) {
			  this.setPlaylistData(data);
			  if (data.date) this.current_date = data.date;
			}.bind(this));
		},
		latest : function() {
			this.mode = 'main';
			if (this.latest_date && this.storage[this.latest_date]) {
				this.actual_date = this.latest_date;
			}
			else this.remote("latest", {}, function(data) {
			  this.setPlaylistData(data);
			  if (data.date) this.latest_date = data.date;
			}.bind(this));
		},
		archive: function(e) {
			this.$refs.picker.open(e);
		},
		nextprev : function(is_next) {
			var method = is_next ? "next" : "prev";
			var nextprev_date = is_next ? this.next_date(this.actualDate) : this.prev_date(this.actualDate);
			switch (this.mode) {
				case "main":
					if (this.storage[nextprev_date]) {
						this.actual_date = nextprev_date;
					}
					else this.remote(method, {pl_date : this.actualDate}, function(data) {
						this.setPlaylistData(data);
					}.bind(this));
					break;
				 case "top100":
			     case "top10artists":
					if (is_next) this.top100year++; else this.top100year--; break;
			}
		},
		next : function() {
			this.nextprev(true);
		},
		prev : function() {
		   this.nextprev(false);
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
			if (file.size > 5120) {
				this.showError("Playlist file size cannot be more than 5KB");
				return;
			}
			var reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = function(event) {
				var result = event.target.result;
				var fileName = file.name; 
				
				fetch(this.upload_server,
					{
						method: "POST",
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ data: result, name: fileName })
					})
					.then((res) => { return res.json(); })
					.then((data) => { console.log( "FETCH remote response", data  );
						if (data.status == "ok" && data.pl_date) { 
							console.log('update data'); 
							this.update_data(data.pl_date); 
							this.actual_date = data.pl_date; 
						}
						else if (data.status == "error") this.showError(data.error);
						else this.showError("Error uploading playlist");
				});

			}.bind(this);
		},
		update_data : function(date) { console.log("update data");
			if (moment(date, "YYYY-MM-DD").unix() > moment(this.latest_date, "YYYY-MM-DD").unix()) this.latest_date = date;
			if (moment(date, "YYYY-MM-DD").unix() <= moment().unix()) this.current_date = date;
			if (this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
			if (this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(date, "YYYY-MM-DD").format("YYYY")];
		},
		confirm_delete: function() {
			this.confirmDelete = true;
		},
		delete_playlist : function(plDate, pass) {
			this.remote("delete", { pl_date : plDate, password : pass }, function(data) {
				if (data.ok) {
					if (this.storage[plDate]) delete this.storage[plDate];
					if (this.top100_storage[moment(plDate, "YYYY-MM-DD").format("YYYY")]) delete this.top100_storage[moment(plDate, "YYYY-MM-DD").format("YYYY")];
					if (this.top10_storage[moment(plDate, "YYYY-MM-DD").format("YYYY")]) delete this.top10_storage[moment(plDate, "YYYY-MM-DD").format("YYYY")];
					this.latest();
				}
				else if (data.error) this.showError(data.error);
				else this.showError("Error deleting playlist"); 
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
	   showError : function(error) {
		   this.errorTxt = error; 
	   }
	}
});