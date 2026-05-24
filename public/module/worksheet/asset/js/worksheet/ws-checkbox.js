/* eslint-disable */
(function($) {
	'use strict';
	var checkboxActions = {
		destroy: function() {
			var checkbox = this;
			var _options = this.data('_options');
			var obj = checkbox.data('target');
			if(obj && obj.length > 0) obj.remove();
			if(checkbox.parent().find("i").length > 0) checkbox.parent().find("i").remove();
			checkbox.off("change");
			checkbox.show();
			return this;
		},
		render: function() {
			var checkbox = this;
			var _options = this.data('_options');
			var obj = $('<i class="fa text-primary" aria-hidden="true"></i>');
			checkbox.data('target', obj);
			obj.data('role', checkbox.attr('type'));
			obj.data('checked', checkbox.is('[checked]'));
			obj.data('target', checkbox);
			obj.data('isO', checkbox.data('isO') == undefined ? true : checkbox.data('isO'));
			obj.addClass(checkbox.attr("class"));
			obj.attr("style", checkbox.attr("style"));
			checkbox.hide();
			switch( obj.data('role') ) {
				case "radio":
					if(obj.data('isO')) obj.addClass('fa-circle-o');
					else obj.addClass('fa-circle');
					break;
				default:
					if(obj.data('isO')) obj.addClass('fa-square-o');
					else obj.addClass('fa-square');
					break;
			}
			if(checkbox.is('[disabled]')) {
				if(checkbox.parent()[0].tagName.toUpperCase() == "LABEL") {
					checkbox.parent().addClass('disabled');
				} else {
					obj.addClass('disabled');
				}
			}
			if(_options.hasOwnProperty('beforeChange')) obj.on('beforeChange', _options.beforeChange);
			if(_options.hasOwnProperty('changed')) obj.on('changed', _options.changed);
			obj.on('setCheck', function(e, checked) {
				$(this).data('checked', checked);
				if($(this).data('target').prop('checked') != checked) $(this).data('target').prop('checked', checked);
				if($(this).closest('thead').length > 0) {
					var tObj = $(this);
					var idx = $(this).closest('th, td').index();
					$(this).closest('table').find('tbody tr').each(function() {
						$(this).children().eq(idx).find('input[type=' + tObj.data('role') +']').prop('checked', checked).trigger('change');
					});
				}
				if($(this).data('checked')) {
					if($(this).data('role') == 'radio') {
						if($(this).data('isO')) $(this).removeClass('fa-circle-o').addClass('fa-circle');
						else $(this).removeClass('fa-circle').addClass('fa-dot-circle');
					} else {
						if($(this).data('isO')) $(this).removeClass('fa-square-o').addClass('fa-check-square-o');
						else $(this).removeClass('fa-square').addClass('fa-check-square');
					}
				} else {
					if($(this).data('role') == 'radio') {
						if($(this).data('isO')) $(this).removeClass('fa-circle').addClass('fa-circle-o');
						else $(this).removeClass('fa-dot-circle').addClass('fa-circle');
					} else {
						if($(this).data('isO')) $(this).removeClass('fa-check-square-o').addClass('fa-square-o');
						else $(this).removeClass('fa-check-square').addClass('fa-square');
					}
				}
			});
			if(checkbox.parent()[0].tagName.toUpperCase() != "LABEL") {
				obj.click(function(e) {
					e.stopPropagation();
					if(!$(this).triggerHandler('beforeChange')) return false;
					$(this).trigger('setCheck', $(this).data('checked') ? false:true);
					$(this).trigger('changed');
					$(this).data('target').trigger('change');
					return false;
				});
			}
			checkbox.change(function(e) {
				if(!obj.triggerHandler('beforeChange')) {
					$(this).prop('checked', $(this).prop('checked') ? false:true);
					return;
				}
				if($(this).attr('type').toUpperCase() == "RADIO") {
					$("input[name="+$(this).attr('name')+"]:not([name="+$(this).attr('name')+"][value="+$(this).val()+"])").prop('checked', false).each(function() {
						$(this).data('target').trigger('setCheck', [false]);
					});
				}
				obj.trigger('setCheck', [$(this).prop('checked')]);
			});
			obj.trigger('setCheck', obj.data('checked'));
			obj.insertBefore(checkbox);
			return this;
		},
		init: function(options) {
			var defaults = {
				beforeChange: function(){return true;}
			};
			this.each(function() {
				var _options = $.extend(true, {}, defaults);
				_options = $.extend(true, _options, options);
				_options = $.extend(true, _options, $(this).data());
				$(this).data("_options", _options);
				checkboxActions.render.call($(this));
			});
			return this;
		}
	};
	$.fn.checkbox = function(action) {
		if( checkboxActions[action] ) {
			return checkboxActions[action].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return checkboxActions.init.apply(this, arguments);
		}
	};

	  /**
	   * Initialize tagsinput behaviour on inputs and selects which have
	   * checkbox & radio
	   */
	  $(function() {
	    //$("input[type=checkbox], input[type=radio]").checkbox();
	  });
})($);