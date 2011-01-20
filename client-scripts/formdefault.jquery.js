(function( $ ){

  $.fn.formDefault = function(options) {
  
    var max = 0;

	var settings = {
		'default-value' : 'default',
		"stay-blank" : false
	};

	if ( options ) { 
		$.extend( settings, options );
	}

   return this.each(function() {
		$this = $(this);
		var overlay = $this.children('label');
		var form = $this.children("input");
console.log(overlay.length);
		var updateForm = function(val, newVal) {
			if(form.val() == ''){
				overlay.fadeIn('fast');
			} else {
				overlay.css('display', 'none');
			}
		}
		
		form.bind('keyup.formDefault', function() {
			console.log('calling keyup');
			updateForm();
		
		});
		form.bind('focus.formDefault', function() {
			console.log('calling focus');
			updateForm();
		});
		form.bind('blur.formDefault', function() {
			console.log('calling blur');
			updateForm();
		});
    });
  };
})( jQuery );