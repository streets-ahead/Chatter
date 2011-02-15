/*
 * Copyright (C) 2011 by Streets Ahead LLC
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 * 
 * A little jQuery plugin to handle inner labels for forms.
 *
 * Written by Streets Ahead LLC. http://streetsaheadllc.com
 * 
 */ 

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