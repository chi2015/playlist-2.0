$.fn.pl_calendar = function(options) {
	
	var plCalendar = {
	setDate : function() {},
	cTimestamp : moment().unix(),
	selectedDate : moment().format("YYYY-MM-DD"),
	yRange : [],
	is_active : false,
	$year : '',
	guid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },
	init : function($el, options) {
		this.id = this.guid();
		$('body').append('<div class="calendar-main" id="'+this.id+'">'+
  '<div class="calendar-head">'+
    '<div class="month-block">'+
      '<div class="month-prevprev">'+
        '<<'+
      '</div>'+
      '<div class="month-prev">'+
        '<'+
      '</div>'+
      '<div class="month-name">'+
      '</div>'+
      '<div class="month-next">'+
        '>'+
      '</div>'+
      '<div class="month-nextnext">'+
        '>>'+
      '</div>'+
    '</div>'+
    '<select class="calendar-year">'+
    '</select>'+
    '<div class="calendar-close">X</div>'+
  '</div>'+
  '<div class="calendar-daynames"></div>'+
  '<div class="calendar-days">'+
  '</div></div>');
		this.$calendar_main = $('.calendar-main#'+this.id);
		if (options.is_mobile) {
			this.$calendar_main.width($(window).height() < $(window).width() ? Math.floor($(window).height()/0.75) : $(window).width() );
			this.$calendar_main.offset({top: 0, left: 0});
		} else {
		
		    this.$calendar_main.width($el.width() >= 400 ? $el.width() : 400);
		    this.$calendar_main.height(Math.floor(this.$calendar_main.width()*0.75));
		    this.$calendar_main.offset({top: $el.offset().top + $el.height(), left : $el.offset().left});
		}
		this.$calendar_main.css('font-size', Math.floor(this.$calendar_main.width() / 22) + 'px');
		this.$year = $('.calendar-main#'+this.id+' .calendar-year');
		this.$year.css('font-size', Math.floor(this.$calendar_main.width() / 22) + 'px');
		this.$calendar_days = $('.calendar-main#'+this.id+' .calendar-days');
		this.$month_next = $('.calendar-main#'+this.id+' .month-next');
		this.$month_prev = $('.calendar-main#'+this.id+' .month-prev');
		this.$month_nextnext = $('.calendar-main#'+this.id+' .month-nextnext');
		this.$month_prevprev = $('.calendar-main#'+this.id+' .month-prevprev');
		this.$month = $('.calendar-main#'+this.id+' .month-name');
		for (var y=options.yearRange[0]; y<=options.yearRange[1]; y++)
			this.yRange.push(y);
		this.setDate = options.setDate;
		if (options.cDate) {
			this.cTimestamp = moment(options.cDate,"YYYY-MM-DD").unix();
			this.selectedDate = options.cDate;
		}
		var year_str = '';
		this.yRange.forEach(function(year) {
			year_str += '<option value="'+year+'">'+year+'</option>';
			this.$year.html(year_str);
		}.bind(this));
		for (var dn = 0; dn<7; dn++)
			$('.calendar-main#'+this.id+' .calendar-daynames').append('<div class="dayname">'+moment.weekdays()[dn].substr(0,3)+'</div>');
		var that = this;
		this.$month_next.on('click', function() {
			if ($(this).hasClass('nodisplay')) return;
			that.cTimestamp = moment.unix(that.cTimestamp).add(1, 'month').unix();
			that.render();
		});
		
		this.$month_prev.on('click', function() {
			if ($(this).hasClass('nodisplay')) return;
			that.cTimestamp = moment.unix(that.cTimestamp).subtract(1, 'month').unix();
			that.render();
		});
		
		this.$month_nextnext.on('click', function() {
			if ($(this).hasClass('nodisplay')) return;
			that.cTimestamp = moment.unix(that.cTimestamp).add(1, 'year').unix();
			that.render();
		});
		
		this.$month_prevprev.on('click', function() {
			if ($(this).hasClass('nodisplay')) return;
			that.cTimestamp = moment.unix(that.cTimestamp).subtract(1, 'year').unix();
			that.render();
		});

		this.$year.on('change', function() {
			that.cTimestamp = moment(moment.unix(that.cTimestamp).format($(this).val()+"-MM-DD"), "YYYY-MM-DD").unix();
			that.render();
		});
		
		$('.calendar-main#'+this.id+' .calendar-close').on('click', function() {
			this.close();
		}.bind(this));
		
		this.render();
		this.$calendar_main.hide();
	},
	render : function() {
		this.$calendar_days.empty();
		this.$year.val(moment.unix(this.cTimestamp).get('year'));
		this.$month.html(moment.months()[moment.unix(this.cTimestamp).get('month')]);
		var firstDayOfWeek = moment(moment.unix(this.cTimestamp).format("YYYY-MM-01")).day();
		var daysInMonth = moment(moment.unix(this.cTimestamp).format("YYYY-MM")).daysInMonth();
		var currentDay = moment.unix(this.cTimestamp).get('date');
		for (var i=1-firstDayOfWeek; i<=daysInMonth; i++)
		this.$calendar_days.append('<div class="day-item'+this.getItemClass(i)+'">'+(i > 0 ? i : '')+'</div>');
		var that = this;
		this.$calendar_days.find('.day-item').on('click', function() {
			if (+$(this).html() > 0) {
				that.cTimestamp = moment(moment.unix(that.cTimestamp).format("YYYY-MM-"+that.getDayStr($(this).html())), "YYYY-MM_DD").unix();
				that.selectedDate = moment.unix(that.cTimestamp).format("YYYY-MM-DD");
				that.setDate(that.selectedDate);
				that.render();
				that.close();
			}
		});
		this.$month_next.removeClass('nodisplay').html('>');
		this.$month_prev.removeClass('nodisplay').html('<');
		this.$month_nextnext.removeClass('nodisplay').html('>>');
		this.$month_prevprev.removeClass('nodisplay').html('<<');
		
		if (moment.unix(this.cTimestamp).get('year')==this.yRange[0]) {
			this.$month_prevprev.addClass('nodisplay').html('');
			if (moment.unix(this.cTimestamp).get('month') == 0)
				this.$month_prev.addClass('nodisplay').html('');
		}
		
		if (moment.unix(this.cTimestamp).get('year')==this.yRange[this.yRange.length-1]) {
			this.$month_nextnext.addClass('nodisplay').html('');
			if (moment.unix(this.cTimestamp).get('month') == 11)
				this.$month_next.addClass('nodisplay').html('');
		}
	},
	getItemClass : function(i) {
		if (i<=0) return ' nodisplay';
		if (i==moment.unix(this.cTimestamp).get('date') &&  moment.unix(this.cTimestamp).format("YYYY-MM-DD") == this.selectedDate) return ' current';
		return '';
	},
	getDayStr : function(num) {
		return num < 10 ? "0"+num : num;
	},
	close : function() {
		this.$calendar_main.hide();
		this.is_active = false;
	},
	show : function() {
		this.$calendar_main.show();
		this.is_active = true;
	}	
};
	
	plCalendar.init($(this), options);
	$(this).on('click', function() {
		if (plCalendar.is_active) plCalendar.close();
		else plCalendar.show();
	});
	if (options.$button) options.$button.on('click' , function() {
		if (plCalendar.is_active) plCalendar.close();
		else plCalendar.show();
	});
};
