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
	// ROUTING (DIRECTOR LIBRARY)
	///======================///

	const home = function() {};

	const login = function() {
		initLogIn();
	};
	const register = function() {
		initRegister();
	};
	const dashboard = function() {
		initDashboard();
	};
	const project = function(projectID) {
		initProject(projectID);
	};

	const routes = {
		'/': home,
		'/login': login,
		'/register': register,
		'/dashboard/': dashboard,
		'/project/:id': project
	};

	const router = Router(routes);

	router.init('/project/vFh5srQztWPjM5nypUEW');

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

	function initProject(projectID) {
		$('.main').empty();
		loadProject(projectID);
		getProjectList('fEmkXIHnhMVeG6bbJFqu');
	}

	function getProjectList(userID) {
		$('.projectNav').empty();

		db.collection('users')
			.doc(userID)
			.get()
			.then(function(doc) {
				const projectList = doc.data().boards;

				for (const project of projectList) {
					db.collection('boards')
						.doc(project)
						.get()
						.then(function(doc) {
							const projectName = doc.data().name;
							$('.projectNav').append(
								`
									<li class="active">
										<a href="#/project/${project}" class="projectLink">
											${projectName}
										</a>
									</li>
								`
							);
						})
						.catch(function(error) {
							console.log('Error getting documents: ', error);
						});
				}
			})
			.catch(function(error) {
				console.log('Error getting document:', error);
			});
	}

	// Event listener for creating new list
	$('main').on('keyup', '#newList', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			const projectID = $('.projectDetails').attr('id');
			const listName = $(this).val();

			createList(listName, projectID);

			$(this).val('');
		}
	});

	// Event listener for creating new cards
	$('main').on('keyup', '#newCard', function(e) {
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
	$('main').on('click', '.deleteCard', function(e) {
		e.preventDefault();
		const cardID = $(this)
			.parent()
			.attr('id');

		deleteCard(this, cardID);
	});

	// Event listener for adding new list
	$('main').on('click', '.addList', function(e) {
		e.preventDefault();

		// createList(listName, projectID);
	});

	// Load all lists and cards + display them in the DOM
	function loadProject(projectID) {
		db.collection('boards')
			.doc(projectID)
			.get()
			.then(function(res) {
				// Loop through they array of lists and insert in the DOM

				$('.main').append(
					`
						<div class="projectDetails" id="${projectID}">
							<h1>${res.data().name}</h1>
							<input
							type="text"
							class="newCard"
							id="newList"
							name="newCard"
							placeholder="Add new list"
						/>
						</div>
						<div class="board">
							
							<div class="listContainer" id="vFh5srQztWPjM5nypUEW">
							</div>
						</div>
					`
				);

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
														<p class="cardContent">${cardContent}</p>
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
											<p class="cardContent">${content}</p>
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

	// Create new list
	function createList(name, projectID) {
		db.collection('lists')
			.add({
				name: name
			})
			.then(function(docRef) {
				console.log('Created new list!');

				let newList = `
										<div class="list" id="${docRef.id}">
										<div class="listHeader">
											<h2>${name}</h2>
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
										`;

				// Add new card markup with dynamic list name
				$(newList).appendTo(`.listContainer`);

				const sortedIDs = $(`.listContainer`).sortable('toArray');
				console.log(sortedIDs);

				// Update list array in project document
				db.collection('boards')
					.doc(projectID)
					.update({ lists: sortedIDs })
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
			handle: '.listHeader',
			stop(event, ui) {
				var sortedIDs = $(`#${this.id}`).sortable('toArray');
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

	// Create sortable cards
	function createSortableCards() {
		$('.cardContainer').sortable({
			connectWith: '.cardContainer',
			handle: '.cardContent',
			// scroll: true,
			// scrollSensitivity: 10,
			// scrollSpeed: 10,
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
});
