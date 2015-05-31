/* global io */
/* global myTeam */
/// <reference path="../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../typings/backbone/backbone.d.ts"/>
'use strict';

var Merl = {};

Merl.translate = (function () {
	var dictionary = {
		'rhino': '義大犀牛',
		'lion': '統一獅',
		'elephant': '中信兄弟',
		'monkey': '桃猿'
	};

	return function (team) {
		return dictionary[team.ename || team];
	};
} ());

Merl.mappingColor = (function () {
	var colorMapping = {
		rhino: 'btn-material-deep-purple-A200',
		lion: 'btn-material-orange-A200',
		monkey: 'btn-material-light-blue-A200',
		elephant: 'btn-material-yellow-A200'
	};

	return function (team) {
		return colorMapping[team.ename || team];
	};
} ());

Merl.dispatcher = _.extend({}, Backbone.Events);

Merl.bindSocketEvents = (function () {
	var socketEvents = [
		'pick:start',
		'pick:stop',
		'pick:result',
		'pick:duplicate',
		'draft:end',
		'draft:restart',
		'calibrate'
	];
	var capitalize = function (string) {
			return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
	};
	
	_.each(socketEvents, function (event) {
		io.socket.on(event, function (data) {
			console.log(capitalize(event) + '!\n', data);
			Merl.dispatcher.trigger(event, data);
		});
	});
} ());

/**
 * 目前的選秀結果
 *
	*/
var ResultView = Backbone.View.extend({
    initialize: function () {
		Merl.dispatcher.on('pick:result', this.refresh, this);
    },
	refresh: function(data) {
		this.add(data.team, data.round, data.name);
		this.fixIfMissing(data.count - 1);
	},

	add: function (team, round, name) {
		this.$el.find('td[team=' + team + '][round=' + round + ']').addClass('picked').text(name);
	},

	fixIfMissing: function(count) {
		var missings = [];
		var self = this;
		
		$('#result td:lt(' + count + ')').each(function(i, v) {
			if (v.textContent === '') {
				missings.push({
					team : v.getAttribute('team'),
					round : v.getAttribute('round')
				});
			}
		});
		
		if (missings.length) {
			missings.forEach(function(missing) {
				io.socket.get('/pick/missing', missing, function (resData) {
					console.log('missing result', resData);
					if (resData !== 'fail') {
						self.add(resData.team, resData.round, resData.name);
					}
				});	
			});
		}
	}
});

/**
 * 導覽列
 * 
 */
var NavigatorView = Backbone.View.extend({
	initialize: function () {

		this.manager = this.$el.find('li.manager');

		Merl.dispatcher.on({
			'init': this.showManager,
			'wait': this.hideManager,
			'pick:start': this.hideManager,
			'pick:stop': this.hideManager
		}, this);
	},

	showManager: function () {
		this.manager && this.manager.show();
	},

	hideManager: function () {
		this.manager && this.manager.hide();
	}
});

/**
 * 候選人列表
 *
 */
var SlateView = Backbone.View.extend({
	initialize: function () {
			Merl.dispatcher.on({
			'pick:start': this.enable,
			'pick:result': this.refresh,
			'pick:stop': this.disable
		}, this);
	},

	events: {
		'click .candidate.chosenable': 'vote'
	},

	enable: function (data) {
		if (!isMyTeam(data.team.ename)) {
			return;
		}

		this.$el
		.find('.candidate:not(.picked)')
		.filter(function (index, td) {
			var ignoreTeams = $(td).attr('ignoreTeams') || '';
			return ignoreTeams.indexOf(data.team) < 0;
		})
		.addClass('chosenable');
		return this;
	},

	refresh: function (data) {
	
		this.clear();

		if (data.name === '放棄') {
			return;
		}

		this.$el.find('td:contains(' + data.name + ')').addClass('picked');
	},

	clear: function () {
		this.$el.find('.active').removeClass('active');
		return this;
	},

	disable: function () {
		this.$el.find('.chosenable').removeClass('chosenable');
		return this;
	},

	vote: function (ev) {
	
		this.clear();
		var candidateCell = $(ev.currentTarget);
		candidateCell.addClass('active');

		Merl.dispatcher.trigger('vote:candidate', { name: candidateCell.text() });
	}
});

/**
 * 碼錶
 */
var StopWatchView = Backbone.View.extend({

	initialize: function () {
		this.clock = this.$el.find('#clock');

		Merl.dispatcher.on({
			'init': this.prepare,
			'calibrate' : this.calibrate,
			'wait': this.wait,
			'pick:start': this.start,
			'pick:duplicate': this.pause,
			'pick:restart': this.restart,
			'draft:restart': this.restart,
			'draft:end': this.end,
			'finished': this.end
		}, this);
	},

	prepare: function (data) {
		this.countDown(data.countDownSeconds);
	},

	calibrate: function (data) {
		this.countDown(data.countDownSeconds);
	},
	
	wait: function (data) {
		this.countDown(data.countDownSeconds);
	},

	start: function (data) {
		this.countDown(data.countDownSeconds);
	},

	pause: function (data) {
	},

	restart: function (data) {
		this.countDown(data.countDownSeconds);
	},

	end: function (data) {
		data.countDownSeconds && this.restart(data);
	},

	countDown: function (timeInSeconds) {
		this.clock.empty();
		$('<span/>', {
			'data-seconds': timeInSeconds
		}).appendTo(this.clock)
			.kkcountdown({
			hoursText: '：',
			minutesText: '：',
			displayZeroDays: false,
			rusNumbers: false
		});
	}
});

/**
 * 選秀投單
 *
 */
var BallotView = Backbone.View.extend({

	events: {
		'submit': 'submit'
	},

	initialize: function () {
		this.button = this.$el.find('#submit')
			.text(Merl.translate(myTeam) + '指名');
		this.disable();

		Merl.dispatcher.on({
			'pick:start': this.start,
			'vote:candidate': this.voteCandidate
		}, this);
	},

	start: function (data) {
		if (!isMyTeam(data.team.ename)) {
			return;
		}

		this.$el.find('input[name=round]').val(data.round);
		this.$el.find('input[name=draftNo]').val(data.draft.no);
		this.disable();
		return this;
	},

	voteCandidate: function (candidate) {
		this.enable();
		this.$el.data('candidateName', candidate.name);
	},

	enable: function () {
		this.button.prop('disabled', false).removeClass('btn-default').addClass('btn-danger');
		return this;
	},

	disable: function () {
		this.button.prop('disabled', true).removeClass('btn-danger').addClass('btn-default');
		return this;
	},

	setText: function (text) {
		this.button.html(text || this.button.text());
		return this;
	},

	submit: function (e) {
	
		e.preventDefault();

		this.disable();
		slate.disable();

		var candidateName = this.$el.data('candidateName'),
			data = {
				name: candidateName,
				round: null
			};

		this.$el.find('form').serializeArray().map(function (item) {
			data[item.name] = item.value;
		});

		console.log('submit ballot', data);

		io.socket.post('/pick', data, function (resData) {
			console.log('submit response', resData);
			if (resData === 'success') {
				Merl.dispatcher.trigger('submit:candidate', data);
			}
		});

		bulletin.announce('voting');
	}
});

/**
 * 公佈欄
 *
 */
var BulletinView = Backbone.View.extend({

    initialize: function () {
			Merl.dispatcher.on({
			'init': this.prepare,
			'wait': this.wait,
			'pick:start': this.start,
			'pick:result': this.result,
			'pick:duplicate': this.pause,
			'submit:candidate': this.submitCandidate,
			'draft:end': this.end,
			'draft:restart': this.restart,
			'finished': this.end
		}, this);
    },

	announce: (function () {
		var router = {
			'prepare': function () {
				return '選秀即將開始';
			},

			'start': function (data) {
				this.roundData = data;
				return Merl.translate(data.team) + '第 ' + data.round + ' 輪開始，請指名';
			},

			'voting': function () {
				return '投單中…';
			},

			'submit': function (candidate) {
				return Merl.translate(this.roundData.team) + '第 ' + this.roundData.round + ' 輪，你指名了' + ' ' + candidate.name;
			},

			'result': function (data) {
				return '本輪結果：' + data.name;
			},

			'pause': function (data) {
				return '本輪結果為 ' + data.names.join(',') + '，因票數相同，將重新選秀。';
			},

			'wait': function (data) {
				return Merl.translate(data.team.ename) + '第 ' + data.round + ' 輪指名中，請等待本輪結束。';
			},

			'restart': function (data) {
				return '本次選秀已結束，即將在' + data.countDownSeconds + '秒後重新開始。';
			},

			'end': function () {
				return '本次選秀結束。';
			}
		};

		return function (route, data) {
			bulletin.text(router[route](data));
		};

	} ()),

	text: function (texxt) {
		this.$el.html('<span>' + texxt + '</span>');
	},

	prepare: function (data) {
		bulletin.announce('prepare');
	},

	wait: function (data) {
		this.announce('wait', data.round);
	},

	start: function (data) {
		isMyTeam(data.team) ? this.announce('start', data) : this.announce('wait', data);
	},

	result: function (data) {
		this.announce('result', data);
	},

	pause: function (data) {
		this.announce('pause', data);
	},

	submitCandidate: function (candidate) {
		this.announce('submit', candidate);
	},

	restart: function (data) {
		this.announce('restart', data);
	},

	end: function (data) {
		data.countDownSeconds ? this.announce('restart', data) : this.announce('end');
	}
});

/**
 * 之前的模擬選秀結果
 *
 */
var PastResultView = Backbone.View.extend({

	initialize: function () {
		Merl.dispatcher.on({
			'pastResult:show': this.render
		}, this);
    },

	render: function (data) {
		$('.overlay').show();
	}
});

var navigatorBar, slate, result, ballot, stopWatch, bulletin, pastResult;
$(document).ready(function () {
	
	navigatorBar = new NavigatorView({ el: $('#navigator')});
	slate = new SlateView({ el: $('#slate') });
	result = new ResultView({ el: $('#result') });
	ballot = new BallotView({ el: $('#ballot') });
	stopWatch = new StopWatchView({ el: $('#stopWatch') });
	bulletin = new BulletinView({ el: $('#bulletin') });
	pastResult = new PastResultView({ el: $('#pastResult') });

	io.socket.get('/hello', function (data) {
		console.log('say hello to server', data);
		Merl.dispatcher.trigger(data.state.toLowerCase(), data);
	});

	$('.showPastResult').click(function (e) {
		e.preventDefault();
		Merl.dispatcher.trigger('pastResult:show');
	});

	$('.overlay').click(function () {
		$(this).hide();
	});

	$.material.ripples();
});

var isMyTeam = function (team) {
	return team === myTeam || team.ename === myTeam;
};

Merl.dispatcher.on('draft:restart', function(data) {
	setTimeout(function() {
		location.reload();
	}, 	data.countDownSeconds * 1000);
});

Merl.dispatcher.on('finished', function(data) {
	if (data.countDownSeconds) {
		setTimeout(function() {
			location.reload();
		}, 	data.countDownSeconds * 1000);
	}
});