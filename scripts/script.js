$(document).ready(function() {
	// Make lists sortable
	$('.board').sortable();

	// Event listener for creating new lists
	$('input[name="newList"]').keyup(function(event) {
		if (event.key == 'Enter' || event.keyCode == '13') {
			$(this).before(
				'<div class="list"><h2 class="listHeader">' +
					$(this).val() +
					'</h2><input type="text" class="newCard" name="newCard" placeholder="New Card..." /></div>'
			);
			$(this).val('');
		}
	});
});
