$(document).ready(function() {
	// Make lists sortable
	$('.listContainer').sortable();

	// Make cards sortable
	$('.cardContainer').sortable();

	// Event listener for creating new lists
	$('#newList').on('keyup', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			$(this).before(
				'<div class="list"><h2 class="listHeader">' +
					$(this).val() +
					'</h2><input type="text" class="newCard" id="newCard" name="newCard" placeholder="New Card..." /></div>'
			);
			$(this).val('');
		}
	});

	// Event listener for creating new cards
	$('.board').on('keyup', '#newCard', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			console.log('New card');
			$(this).before('<div class="card">' + $(this).val() + '</div>');
			$(this).val('');
		}

		$('.list').sortable();
	});
});
