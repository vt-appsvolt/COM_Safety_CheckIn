$(document).on('submit', 'form', function(){
	var $form = $(this);
	$form.find('input.currency.mask').each(function(){
		var $input = $(this),
			name = $(this).attr('name').replace('-mask', '');
		$form.find('input[name='+name+']').val( Utils.currencyLongValue( $input.val() ) );
	});
	
});
Inputmask.extendDefaults({
  'autoUnmask': true,
  'removeMaskOnSubmit': true
});
Inputmask.extendAliases({
	'percentage': {
		'autoUnmask': true,
		'removeMaskOnSubmit': true
	},
	'currency': {
		'autoUnmask': true,
		'removeMaskOnSubmit': true,
		'allowPlus': false,
		'allowMinus': false
	},
	'rate': {
		'alias': 'decimal',
		'digits': 2,
		'numericInput': true,
		'greedy': false,
		'autoUnmask': false,
		'removeMaskOnSubmit': false,
		'allowPlus': false,
		'allowMinus': false,
		'placeholder': '0'
	},
	'currencydigits': {
		'alias': 'decimal',
		'autoUnmask': true,
		'removeMaskOnSubmit': true,
		'allowPlus': false,
		'allowMinus': false,
		'digits': 2
	}
});
