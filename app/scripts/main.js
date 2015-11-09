 /*
	- Table of content -

	=Debug
	=Mobile Nav
	=Gender options
	=Country options
	=Form validate
	=Tag form validate
	=Step 1 validate
	=Step 2 validate
	=Social check binding
	=Function
-------------------------------------------------- */

/*	=Debug: Jump to step 2
-------------------------------------------------- */
// $('.js-step-2-nav').trigger('click');

$(document).ready(function(){

	/*	=Mobile Nav
	-------------------------------------------------- */
	$('.mob-nav-toggle-button').on('click', function() {
		$(this).toggleClass('active');
	});



	/*	=Gender options
	-------------------------------------------------- */
	$('.js-gender').change(function() {
		$('.filter-option').attr('style','color: #171717!important;');
		$('.js-gender').next('.with-errors').text('');
	});

	/*	=Country options
	-------------------------------------------------- */
	// Rename title
	setTimeout(function(){
		$('.js-countries .bfh-selectbox-option').text('Country');
		$('.js-states .bfh-selectbox-option').text('City');
	}, 1000);

	// Name <input>
	$('.js-countries input').attr('name', 'country');
	$('.js-states input').attr('name', 'city');

	// Country update, clean error text
	$('.bfh-selectbox-options li').click(function() {
		var thisVal = $(this).text();
		if(thisVal != '') {
			$('.js-countries').next('.with-errors').text('');
			$('.bfh-selectbox-option').addClass('font-black');
		}
	});

	$(document).keydown(function(e){
    var selectbox = $('.bfh-selectbox.open');
    if(selectbox.length == 0) return;

    selectbox
      .find('li a[data-option]')
      .filter(function() {
        return $(this).text().toUpperCase().indexOf(String.fromCharCode(e.keyCode)) === 0;
      })
      .get(0)
      .click();
    selectbox.find('.bfh-selectbox-toggle').click();
  });

	$('.js-step-1-nav').on('click',function() {
		$('.js-step-2-nav').addClass('disable');
		$('.js-step-3-nav').addClass('disable');
	});
	$('.js-step-2-nav').on('click',function() {
		$('.js-step-3-nav').addClass('disable');
	});

	/*	=Form validate
	-------------------------------------------------- */
	if($('body').hasClass('form')) {
		$('form').validator().on('submit', function (e) {
		  if (e.isDefaultPrevented()) {
		    // handle the invalid form...
		    // alert('bad')`
		  } else {
		  	e.preventDefault();

      	var formData = $(this).serializeArray();
      	var formObj = {};
      	for (var i = 0; i < formData.length; i ++) {
      		formObj[formData[i].name] = formData[i].value;
      	}
      	$.post('/profile', formData)
      	.done(function(data) {
      		console.log('done');
				  $(window).unbind('beforeunload');

      		window.location = data.redirect;
      	})
      	.fail(function() {
      		console.log('fail');
      	});
		    // everything looks good!
		    // alert('good')
		  }
		});
	}

	/*	=Tag form validate
	-------------------------------------------------- */
	$('.tag-form-group input').on('blur',function() {
		if($(this).parents('.tag-form-group').find('.tag').length == 0) {
			$(this).parents('.tag-form-group').next('.with-errors').html('<ul class="list-unstyled"><li>Please input at least one tag</li></ul>');
		} else {
			$(this).parents('.tag-form-group').next('.with-errors').html('');
		}
	});

	/*	=Step 1 validate
	-------------------------------------------------- */
	$('.js-step-1-continue').on('click',checkStep1 );
	function checkStep1() {
		// 1. Do validator
		var hasErrorMsg = $('.js-step-1 .with-errors ul').length;
		var blankQty = 0;

		$('.js-step-1 input:required').each(function() {
			var selfVal = $(this).val()
			if(selfVal == '')
				blankQty++;
		});

		if(hasErrorMsg == 0 && blankQty == 0) {
			$('.js-step-2-nav').removeClass('disable');
			$('.js-step-2-nav').trigger('click');
			$("html, body").animate({ scrollTop: 0 }, "slow");
			$(window).bind('beforeunload', function(){
				return 'You have not completed the application process.';
			});
		} else {
		  validateSelection();
		  $('form').submit();
		  $('html, body').animate({
	    	scrollTop: $('.js-step-1 .with-errors ul').closest('article').offset().top
	      }, 500);
		}
	}

	/*	=Step 2 validate
	-------------------------------------------------- */
	var checkedOptions = 0;
	window.b = checkedOptions;

	$('.js-step-2-continue').on('click', function() {
		validateStep2(checkedOptions);

		// 1. Do validator
		var hasErrorMsg = $('.js-step-2 .with-errors ul').length;
		var blankQty = 0;

		$('.js-step-2 input:required').each(function() {
			var selfVal = $(this).val()
			// alert(selfVal)
			if(selfVal == '')
				blankQty++;
		});

		if(hasErrorMsg == 0 && blankQty == 0) {
			$('.js-step-3-nav').removeClass('disable');
			$('.js-step-3-nav').trigger('click');
		} else {
		  $('html, body').animate({
	    	scrollTop: $('.js-step-2 .with-errors ul').closest('article').offset().top
	      }, 500);
		}
	});

	/*	=Social check binding
	-------------------------------------------------- */
	$('.js-social').change('click',function(){
		var isChecked = $(this).is(':checked');
		var matchName = $(this).data('name')

		if(isChecked) {
			checkedOptions--;
			$('.js-' + matchName).slideDown();
		} else {
			checkedOptions++;
			$('.js-' + matchName).slideUp();
		}
		if(checkedOptions == 0) {
			$('.sub-question.title').slideUp();
			$('#js-social-checkbox').next('.with-errors').html('<ul class="list-unstyled"><li>Please select at least one platform</li></ul>');
		} else {
			$('.sub-question.title').slideDown();
			$('#js-social-checkbox').next('.with-errors').html('');
		}

	});
	$('.js-sub-question input').on('click',function(){
		$(this).parents('article').find('.with-errors').html('');
	});
});

/*	=Function
-------------------------------------------------- */
function validateStep2() {
	if(!$('.js-social').is(':checked')) {
		$('#js-social-checkbox').next('.with-errors').html('<ul class="list-unstyled"><li>Please select at least one platform</li></ul>');
	} else {
		$('#js-social-checkbox').next('.with-errors').html('');
	}
	$('.tag-form-group').each(function() {
		if($(this).find('.tag').length == 0) {
			$(this).next('.with-errors').html('<ul class="list-unstyled"><li>Please input at least one tag</li></ul>');
		} else {
			$(this).next('.with-errors').html('');
		}
	});
	$('#js-social-checkbox input:checkbox:checked').each(function () {
		var platform = $(this).attr('data-name');

	    $('article.'+ platform).each(function () {
			var checked = false;
			$(this).find('input:checked').each(function () {
				checked = true;
				return false;
			});
			if(!checked) {
				$(this).find('.with-errors').html('<ul class="list-unstyled"><li>Please select at least one platform</li></ul>');
			} else {
				$(this).find('.with-errors').html('');
			}
		});
	});
}

function validateSelection() {
	var city = $('.js-countries input').val();
	var gender = $('.js-gender option:selected').val();

	if(city == '')
		$('.js-countries').next('.with-errors').html('<ul class="list-unstyled"><li>Please select country</li></ul>');

	if(gender == '')
		$('.js-gender').next('.with-errors').html('<ul class="list-unstyled"><li>Please select gender</li></ul>');
}
