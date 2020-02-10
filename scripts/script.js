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
						<div class="list" id="${list}">
							<div class="listHeader">
								<h2>${listName}</h2>
							</div>
							<ul class="cardContainer">
							</ul>
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
										<li class="card" id=${card}>
											<p>${cardContent}</p>
										</li>`;

									// Add new card markup with dynamic list name
									$(newCard).appendTo(`#${list} .cardContainer`);
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
			createSortableList();
		}
	})
	.catch(function(error) {
		console.log('Error getting documents: ', error);
	});

function createSortableCards() {
	$('.cardContainer').sortable({
		connectWith: '.cardContainer',
		// create(event, ui) {
		// 	console.log('An item was created');

		// 	var sortedIDs = $(`#${this.id}`).sortable('toArray');
		// 	console.log(this.id);
		// 	console.log(sortedIDs);
		// },
		stop(event, ui) {
			console.log('An item was moved');
			console.log(
				$(this)
					.parent()
					.attr('id')
			);

			const parentID = $(this)
				.parent()
				.attr('id');

			const sortedIDs = $(`#${parentID} .cardContainer`).sortable('toArray');
			console.log(sortedIDs);

			db.collection('lists')
				.doc(parentID)
				.update({ cards: sortedIDs })
				.then(function() {
					console.log('Document successfully written!');
				})
				.catch(function(error) {
					console.error('Error writing document: ', error);
				});
		},
		receive: function(event, ui) {
			console.log('Item was received');

			const parentID = $(this)
				.parent()
				.attr('id');

			const sortedIDs = $(`#${parentID} .cardContainer`).sortable('toArray');
			console.log(sortedIDs);

			db.collection('lists')
				.doc(parentID)
				.update({ cards: sortedIDs })
				.then(function() {
					console.log('Document successfully written!');
				})
				.catch(function(error) {
					console.error('Error writing document: ', error);
				});
		}
	});
}

function createSortableList() {
	$('.listContainer').sortable({
		stop(event, ui) {
			console.log('An item was moved');
			console.log(this);

			var sortedIDs = $(`#${this.id}`).sortable('toArray');
			console.log(this.id);
			console.log(sortedIDs);

			db.collection('boards')
				.doc(this.id)
				.update({ lists: sortedIDs })
				.then(function() {
					console.log('Document successfully written!');
				})
				.catch(function(error) {
					console.error('Error writing document: ', error);
				});
		}
	});
}

// MAIN

$(document).ready(function() {
	// Make lists sortable

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
