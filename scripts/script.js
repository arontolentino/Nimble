var firebaseConfig = {
	apiKey: 'AIzaSyAkWrlB49WYt1Er1-pnmIJo65MgNsWYKds',
	authDomain: 'nimble-io.firebaseapp.com',
	databaseURL: 'https://nimble-io.firebaseio.com',
	projectId: 'nimble-io',
	storageBucket: 'nimble-io.appspot.com',
	messagingSenderId: '796601610417',
	appId: '1:796601610417:web:df8ea13e938768ef793290'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// Get all lists part of a specific board from Firebase
db.collection('boards')
	.doc('vFh5srQztWPjM5nypUEW')
	.get()
	.then(function(res) {
		// Loop through they array of lists and insert in the DOM
		for (const list of res.data().lists) {
			db.collection('lists')
				.doc(`${list}`)
				.get()
				.then(function(res) {
					const listName = res.data().name;
					const listCards = res.data().cards;

					const newList = `
						<div class="list">
							<div class="listHeader">
								<h2>${listName}</h2>
							</div>
							<div class="cardContainer" id="${list}">
							</div>
							<input
								type="text"
								class="newCard"
								id="newCard"
								name="newCard"
								placeholder="Create new card"
							/>
						</div>`;

					$(newList).appendTo('.listContainer');

					// Loop through they array of cards and insert in the DOM
					if (listCards != undefined) {
						// Loop through all cards under a specific list and get more information from firebase
						for (const card of listCards) {
							db.collection('cards')
								.doc(card)
								.get()
								.then(function(doc) {
									// Store card content from firebase
									let cardContent = doc.data().content;

									// Markup for new card
									let newCard = `
										<div class="card" id=${card}>
											<p>${cardContent}</p>
										</div>`;

									// Add new card markup with dynamic list name
									$(newCard).appendTo(`#${list}`);
								})
								.catch(function(error) {
									console.log('Error getting documents: ', error);
								});
						}
					}
					createSortableCards();
				})
				.catch(function(error) {
					console.log('Error getting documents: ', error);
				});
		}
	})
	.catch(function(error) {
		console.log('Error getting documents: ', error);
	});

function createSortableCards() {
	$('.cardContainer').sortable({
		connectWith: '.cardContainer',
		create(event, ui) {
			console.log('An item was created');

			var sortedIDs = $(`#${this.id}`).sortable('toArray');
			console.log(this.id);
			console.log(sortedIDs);
		},
		stop(event, ui) {
			console.log('An item was moved');

			var sortedIDs = $(`#${this.id}`).sortable('toArray');
			console.log(this.id);
			console.log(sortedIDs);
		},
		receive: function(event, ui) {
			console.log('Item was received');

			var sortedIDs = $(`#${this.id}`).sortable('toArray');
			console.log(this.id);
			console.log(sortedIDs);
		}
	});
}

// MAIN

$(document).ready(function() {
	// Make lists sortable
	$('.listContainer').sortable();

	// Make cards sortable
	$('.cardContainer').sortable({
		connectWith: '.cardContainer',
		create(event, ui) {
			console.log('An item was created');
		},
		stop(event, ui) {
			console.log('An item was moved');
			// console.log(event);
			// console.log(ui);
			// var sortedIDs = $('#done').sortable('toArray');
			// console.log(sortedIDs);
		},
		remove(event, ui) {
			console.log('Item was removed');
			// // Find the ID of the list a card transfered from
			// console.log(this.id);
		},
		receive: function(event, ui) {
			console.log('Item was received');
			// console.log(this.id);
			// // Find the ID of the list a card transfered to
			// console.log(this.id);
		}
	});

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
