//init page
$(function(){
	initCarousel();
	positionFixed();
});
//init carousel
function initCarousel(){
	$('.gallery').scrollGallery({
		sliderHolder: '.list1',
		btnPrev:'a.prev',
		btnNext:'a.next',
		duration:650
	});
	$('.gallery').scrollGallery({
		sliderHolder: '.list2',
		btnPrev:'a.prev',
		btnNext:'a.next',
		duration:650
	});
}
//position fixed
function positionFixed(){
	var nav = $('#header'),
		left = nav.offset().left,
		top = nav.offset().top,
		win = $(window),
		ie6 = $.browser.msie && $.browser.version < 7;
	
	win.resize(function(){
		nav.css({position: 'static'});
		left = nav.offset().left;	
		reposition();
	});
	
	function reposition() {
		var scrollNow = win.scrollTop();
		if(scrollNow < top){
			nav.css({position: 'static', left:left, top:0});
		} else {
			if(ie6){
				nav.css({position: 'absolute', left:left, top:scrollNow});
			} else nav.css({position: 'fixed',left:left, top:0});
		}		
	}
	
	win.scroll(reposition);
	
}
// scrolling gallery plugin
jQuery.fn.scrollGallery = function(_options){
	var _options = jQuery.extend({
		sliderHolder: '>div',
		slider:'>ul',
		slides: '>li',
		pagerLinks:'div.pager a',
		btnPrev:'a.link-prev',
		btnNext:'a.link-next',
		activeClass:'active',
		disabledClass:'disabled',
		generatePagination:'div.pg-holder',
		curNum:'em.scur-num',
		allNum:'em.sall-num',
		circleSlide:true,
		pauseClass:'gallery-paused',
		pauseButton:'none',
		pauseOnHover:true,
		autoRotation:false,
		stopAfterClick:false,
		switchTime:5000,
		duration:650,
		easing:'swing',
		event:'click',
		splitCount:false,
		afterInit:false,
		vertical:false,
		step:false
	},_options);

	return this.each(function(){
		// gallery options
		var _this = jQuery(this);
		var _sliderHolder = jQuery(_options.sliderHolder, _this);
		var _slider = jQuery(_options.slider, _sliderHolder);
		var _slides = jQuery(_options.slides, _slider);
		var _btnPrev = jQuery(_options.btnPrev, _this);
		var _btnNext = jQuery(_options.btnNext, _this);
		var _pagerLinks = jQuery(_options.pagerLinks, _this);
		var _generatePagination = jQuery(_options.generatePagination, _this);
		var _curNum = jQuery(_options.curNum, _this);
		var _allNum = jQuery(_options.allNum, _this);
		var _pauseButton = jQuery(_options.pauseButton, _this);
		var _pauseOnHover = _options.pauseOnHover;
		var _pauseClass = _options.pauseClass;
		var _autoRotation = _options.autoRotation;
		var _activeClass = _options.activeClass;
		var _disabledClass = _options.disabledClass;
		var _easing = _options.easing;
		var _duration = _options.duration;
		var _switchTime = _options.switchTime;
		var _controlEvent = _options.event;
		var _step = _options.step;
		var _vertical = _options.vertical;
		var _circleSlide = _options.circleSlide;
		var _stopAfterClick = _options.stopAfterClick;
		var _afterInit = _options.afterInit;
		var _splitCount = _options.splitCount;

		// gallery init
		if(!_slides.length) return;

		if(_splitCount) {
			var curStep = 0;
			var newSlide = $('<slide>').addClass('split-slide');
			_slides.each(function(){
				newSlide.append(this);
				curStep++;
				if(curStep > _splitCount-1) {
					curStep = 0;
					_slider.append(newSlide);
					newSlide = $('<slide>').addClass('split-slide');
				}
			});
			if(curStep) _slider.append(newSlide);
			_slides = _slider.children();
		}

		var _currentStep = 0;
		var _sumWidth = 0;
		var _sumHeight = 0;
		var _hover = false;
		var _stepWidth;
		var _stepHeight;
		var _stepCount;
		var _offset;
		var _timer;

		_slides.each(function(){
			_sumWidth+=$(this).outerWidth(true);
			_sumHeight+=$(this).outerHeight(true);
		});

		// calculate gallery offset
		function recalcOffsets() {
			if(_vertical) {
				if(_step) {
					_stepHeight = _slides.eq(_currentStep).outerHeight(true);
					_stepCount = Math.ceil((_sumHeight-_sliderHolder.height())/_stepHeight)+1;
					_offset = -_stepHeight*_currentStep;
				} else {
					_stepHeight = _sliderHolder.height();
					_stepCount = Math.ceil(_sumHeight/_stepHeight);
					_offset = -_stepHeight*_currentStep;
					if(_offset < _stepHeight-_sumHeight) _offset = _stepHeight-_sumHeight;
				}
			} else {
				if(_step) {
					_stepWidth = _slides.eq(_currentStep).outerWidth(true)*_step;
					_stepCount = Math.ceil((_sumWidth-_sliderHolder.width())/_stepWidth)+1;
					_offset = -_stepWidth*_currentStep;
					if(_offset < _sliderHolder.width()-_sumWidth) _offset = _sliderHolder.width()-_sumWidth;
				} else {
					_stepWidth = _sliderHolder.width();
					_stepCount = Math.ceil(_sumWidth/_stepWidth);
					_offset = -_stepWidth*_currentStep;
					if(_offset < _stepWidth-_sumWidth) _offset = _stepWidth-_sumWidth;
					if(_sumWidth < _stepWidth) _offset = 0;
				}
			}
		}

		// gallery control
		if(_btnPrev.length) {
			_btnPrev.bind(_controlEvent,function(){
				if(_stopAfterClick) stopAutoSlide();
				prevSlide();
				return false;
			});
		}
		if(_btnNext.length) {
			_btnNext.bind(_controlEvent,function(){
				if(_stopAfterClick) stopAutoSlide();
				nextSlide();
				return false;
			});
		}
		if(_generatePagination.length) {
			_generatePagination.empty();
			recalcOffsets();
			var _list = $('<ul />');
			for(var i=0; i<_stepCount; i++) $('<li><a href="#">'+(i+1)+'</a></li>').appendTo(_list);
			_list.appendTo(_generatePagination);
			_pagerLinks = _list.children();
		}
		if(_pagerLinks.length) {
			_pagerLinks.each(function(_ind){
				jQuery(this).bind(_controlEvent,function(){
					if(_currentStep != _ind) {
						if(_stopAfterClick) stopAutoSlide();
						_currentStep = _ind;
						switchSlide();
					}
					return false;
				});
			});
		}

		// gallery animation
		function prevSlide() {
			recalcOffsets();
			if(_currentStep > 0) _currentStep--;
			else if(_circleSlide) _currentStep = _stepCount-1;
			switchSlide();
		}
		function nextSlide() {
			recalcOffsets();
			if(_currentStep < _stepCount-1) _currentStep++;
			else if(_circleSlide) _currentStep = 0;
			switchSlide();
		}
		function refreshStatus() {
			if(_pagerLinks.length) _pagerLinks.removeClass(_activeClass).eq(_currentStep).addClass(_activeClass);
			if(!_circleSlide) {
				_btnPrev.removeClass(_disabledClass);
				_btnNext.removeClass(_disabledClass);
				if(_currentStep == 0) _btnPrev.addClass(_disabledClass);
				if(_currentStep == _stepCount-1) _btnNext.addClass(_disabledClass);
			}
			if(_curNum.length) _curNum.text(_currentStep+1);
			if(_allNum.length) _allNum.text(_stepCount);
		}
		function switchSlide() {
			recalcOffsets();
			if(_vertical) _slider.animate({marginTop:_offset},{duration:_duration,queue:false,easing:_easing});
			else _slider.animate({marginLeft:_offset},{duration:_duration,queue:false,easing:_easing});
			refreshStatus();
			autoSlide();
		}

		// autoslide function
		function stopAutoSlide() {
			if(_timer) clearTimeout(_timer);
			_autoRotation = false;
		}
		function autoSlide() {
			if(!_autoRotation || _hover) return;
			if(_timer) clearTimeout(_timer);
			_timer = setTimeout(nextSlide,_switchTime+_duration);
		}
		if(_pauseOnHover) {
			_this.hover(function(){
				_hover = true;
				if(_timer) clearTimeout(_timer);
			},function(){
				_hover = false;
				autoSlide();
			});
		}
		recalcOffsets();
		refreshStatus();
		autoSlide();

		// pause buttton
		if(_pauseButton.length) {
			_pauseButton.click(function(){
				if(_this.hasClass(_pauseClass)) {
					_this.removeClass(_pauseClass);
					_autoRotation = true;
					autoSlide();
				} else {
					_this.addClass(_pauseClass);
					stopAutoSlide();
				}
				return false;
			});
		}

		if(_afterInit && typeof _afterInit === 'function') _afterInit(_this, _slides);
	});
}