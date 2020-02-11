/// DIRECTOR ROUTING ///

const login = function() {
	console.log('Sign in to access your projects');
};
const register = function() {
	console.log('Register for an account');
};
const projects = function() {
	console.log('View all your projects');
};
const project = function(id) {
	console.log('You are currently viewing project ' + id);
};

const routes = {
	'/login': login,
	'/register': register,
	'/projects': projects,
	'/projects/:id': project
};

var router = Router(routes);

router.init('/');

/// FIREBASE INIT ///
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

/// LOGIN ///
function signInUser(email, password) {
	firebase
		.auth()
		.setPersistence(firebase.auth.Auth.Persistence.SESSION)
		.then(function() {
			// Existing and future Auth states are now persisted in the current
			// session only. Closing the window would clear any existing state even
			// if a user forgets to sign out.
			// ...
			// New sign-in will be persisted with session persistence.
			return firebase.auth().signInWithEmailAndPassword(email, password);
		})
		.catch(function(error) {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;

			console.log(`Sign in error ${errorCode}: ${errorMessage}`);
		});
}

function createUser(email, password) {
	firebase
		.auth()
		.createUserWithEmailAndPassword(email, password)
		.catch(function(error) {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;

			console.log(`User registration error ${errorCode}: ${errorMessage}`);
			// ...
		});
}

firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
	} else {
		// No user is signed in.
	}
});

$(document).ready(function() {
	// Make lists sortable

	// Event listener for creating new lists
	$('#newList').on('keyup', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			// $(this).before(
			// 	'<div class="list"><h2 class="listHeader">' +
			// 		$(this).val() +
			// 		'</h2><input type="text" class="newCard" id="newCard" name="newCard" placeholder="New Card..." /></div>'
			// );
			// $(this).val('');

			console.log(this);
		}
	});

	// Event listener for creating new cards
	$('.board').on('keyup', '#newCard', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			const parentID = $(this)
				.parent()
				.attr('id');

			const newCardContent = $(this).val();

			$(this).val('');

			db.collection('cards')
				.add({
					content: newCardContent
				})
				.then(function(docRef) {
					console.log(this);

					console.log('Created new card!');

					let newCard = `
										<li class="card" id=${docRef.id}>
											<p>${newCardContent}</p>
										</li>`;

					// Add new card markup with dynamic list name
					$(newCard).appendTo(`#${parentID} .cardContainer`);

					const sortedIDs = $(`#${parentID} .cardContainer`).sortable(
						'toArray'
					);
					console.log(sortedIDs);

					db.collection('lists')
						.doc(parentID)
						.update({ cards: sortedIDs })
						.then(function() {
							console.log('Updated list array!');
						})
						.catch(function(error) {
							console.error('Error writing document: ', error);
						});
				})
				.catch(function(error) {
					console.error('Error writing document: ', error);
				});
		}

		$('.list').sortable();
	});

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

	function createSortableCards() {
		$('.cardContainer').sortable({
			connectWith: '.cardContainer',
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

	const db = firebase.firestore();

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
});
