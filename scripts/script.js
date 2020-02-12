///======================///
/// FIREBASE INIT
///======================///

const firebaseConfig = {
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

$(document).ready(function() {
	///======================///
	// ROUTING
	///======================///

	const login = function() {
		initLogIn();
	};
	const register = function() {
		initRegister();
	};
	const dashboard = function() {
		initDashboard();
	};
	const project = function(id) {
		initProject();
	};

	const routes = {
		'/login': login,
		'/register': register,
		'/dashboard/': dashboard,
		'/project/:id': project
	};

	const router = Router(routes);

	router.init('/');

	///======================///
	// Log In
	///======================///

	function initLogIn() {
		$('main').empty();
		$('main').append('<h1>You can login here</h1>');
	}

	function logInUser(email, password) {
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
	///======================///
	// REGISTER
	///======================///

	function initRegister() {
		$('main').empty();
		$('main').append('<h1>You can register here</h1>');
	}

	///======================///
	// DASHBOARD
	///======================///

	function initDashboard() {
		$('main').empty();
		$('main').append('<h1>Dashboard</h1>');
	}

	///======================///
	// PROJECT
	///======================///

	function initProject() {
		$('main').empty();
		$('main').append('<h1>You can login here</h1>');
	}

	loadProject();

	// Event listener for creating new cards
	$('.board').on('keyup', '#newCard', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			const parentID = $(this)
				.parent()
				.attr('id');

			const newCardContent = $(this).val();

			createCard(newCardContent, parentID);

			$(this).val('');
		}
	});

	// Event listener for deleting cards
	$('.board').on('click', '.deleteCard', function(e) {
		const cardID = $(this)
			.parent()
			.attr('id');

		deleteCard(this, cardID);
	});

	// Create new card
	function createCard(content, listID) {
		db.collection('cards')
			.add({
				content: content
			})
			.then(function(docRef) {
				console.log('Created new card!');

				let newCard = `
										<li class="card" id=${docRef.id}>
										<a class="deleteCard" href="#"><i class="fas fa-times"></i></a>
											<p>${content}</p>
										</li>`;

				// Add new card markup with dynamic list name
				$(newCard).appendTo(`#${listID} .cardContainer`);

				const sortedIDs = $(`#${listID} .cardContainer`).sortable('toArray');

				db.collection('lists')
					.doc(listID)
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

	// Create sortable list
	function createSortableList() {
		$('.listContainer').sortable({
			stop(event, ui) {
				var sortedIDs = $(`#${this.id}`).sortable('toArray');

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

	// Create sortable cards
	function createSortableCards() {
		$('.cardContainer').sortable({
			connectWith: '.cardContainer',
			stop(event, ui) {
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

	// Load all lists and cards + display them in the DOM
	function loadProject() {
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

							$('.listContainer').append(
								`
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
									</div>
								`
							);

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

											$(`#${list} .cardContainer`).append(
												`
													<li class="card" id=${card}>
														<a class="deleteCard" href="#"><i class="fas fa-times"></i></a>
														<p>${cardContent}</p>
													</li>
												`
											);
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
	}

	function deleteCard(itemObj, cardID) {
		const listID = $(itemObj)
			.closest('.list')
			.attr('id');

		db.collection('cards')
			.doc(cardID)
			.delete()
			.then(function() {
				console.log('Document successfully deleted!');

				$(`#${cardID}`).remove();

				const sortedIDs = $(`#${listID} .cardContainer`).sortable('toArray');
				console.log(sortedIDs);

				db.collection('lists')
					.doc(listID)
					.update({ cards: sortedIDs })
					.then(function() {
						console.log('Document was deleted and updated the array');
					})
					.catch(function(error) {
						console.error('Error writing document: ', error);
					});
			})
			.catch(function(error) {
				console.error('Error removing document: ', error);
			});
	}

	function projectInit() {
		$('main').empty();

		$('main').append(
			`
				<div class="projectDetails">
					<h1>Project Lorem</h1>
				</div>
				<div class="board">
					<div class="listContainer" id="vFh5srQztWPjM5nypUEW">
					</div>
				</div>
			`
		);
	}
});
