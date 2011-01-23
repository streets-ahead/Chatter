(function( $ ){

  $.fn.formDefault = function(options) {
  
    var max = 0;

   return this.each(function() {
		$this = $(this);
		var overlay = $this.children('label');
		var form = $this.children("input");
		
		$(window).bind('load.formDefault', function() {
			if(form.val() != '') {
				overlay.hide();
			}
		});

		var updateForm = function(val, newVal) {
			if(form.val() == ''){
				overlay.fadeIn('fast');
			} else {
				overlay.css('display', 'none');
			}
		}
		
		form.bind('keyup.formDefault', function() {
			updateForm();
		
		});
		form.bind('focus.formDefault', function() {
			updateForm();
		});
		form.bind('blur.formDefault', function() {
			updateForm();
		});
    });
  };
})( jQuery );