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
	// Firebase Auth Listener
	///======================///

	let userID = document.cookie.replace(
		/(?:(?:^|.*;\s*)uid\s*\=\s*([^;]*).*$)|^.*$/,
		'$1'
	);

	// signOut();

	$('main').on('click', '.signOut', function() {
		signOut();
	});

	function signOut() {
		firebase
			.auth()
			.signOut()
			.then(function() {
				// Sign-out successful.
				document.cookie = 'uid=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
				console.log(
					document.cookie.replace(
						/(?:(?:^|.*;\s*)uid\s*\=\s*([^;]*).*$)|^.*$/,
						'$1'
					)
				);

				window.location.assign(`#/login`);
			})
			.catch(function(error) {
				// An error happened.
			});
	}

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

	const start = function() {
		initTwoColumn();
		initStart();
	};

	const dashboard = function() {
		initDashboard();
	};
	const project = function(projectID) {
		initTwoColumn();
		initProject(projectID);
	};

	const routes = {
		'/login': login,
		'/register': register,
		'/start': start,
		'/project/:id': project
	};

	const router = Router(routes);

	router.init('/login');

	///======================///
	// Two Column
	///======================///

	function initTwoColumn() {
		$('main').empty();

		const twoColumn = `
			<div class="twoColumn">
				<div class="sideBar">
					<div class="logo">
						<h1>Nimble</h1>
					</div>
					<nav>
						<h2>Projects</h2>
						<ul class="projectNav"></ul>
						<input
							type="text"
							class="newCard"
							id="newProject"
							name="newProject"
							placeholder="Add new project"
						/>
						<button class="btn signOut">Sign Out</button>
					</nav>
				</div>
				<div class="main"></div>
			</div>
		`;

		$('main').append(twoColumn);
	}

	///======================///
	// Start
	///======================///

	function initStart() {
		$('.main').empty();

		console.log(userID);

		getProjectList(userID);

		// console.log(userID);

		const startHTML = `
			<div class="start">
				<div class="createProject">
					<h2>It looks like you haven't made a project just yet. Shall we create one?</h2>
					<button class="btn projectBtnFocus">Add Project</button>
				</div>
			</div>
		`;

		$('.main').append(startHTML);
	}

	$('main').on('click', '.projectBtnFocus', function(e) {
		e.preventDefault();
		console.log('Clicked!');
		$('#newProject').focus();
	});

	///======================///
	// Log In
	///======================///

	function initLogIn() {
		$('main').empty();

		const loginHTML = `
			<div class="login">
				<div class="formContainer">
					<div class="form">
						<form class="login-form">
							<input type="email" id="email" placeholder="email"/>
							<input type="password" id="password" placeholder="password"/>
							<button>login</button>
							<p class="message">Not registered? <a href="#/register">Create an account</a></p>
						</form>
					</div>
				</div>
			</div>
		`;

		$('main').append(loginHTML);
	}

	$('main').on('submit', '.login-form', function() {
		const name = $('#name').val();
		const email = $('#email').val();
		const password = $('#password').val();

		logInUser(email, password);
	});

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
			.then(function() {
				console.log('You sucessfully logged in!');

				var uid = firebase.auth().currentUser.uid;
				document.cookie = `uid=${uid}`;
				console.log(document.cookie);

				window.location.assign(`#/start`);
				location.reload();
			})
			.catch(function(error) {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;

				console.log(`Sign in error ${errorCode}: ${errorMessage}`);
			});
	}

	///======================///
	// REGISTER
	///======================///

	function initRegister() {
		$('main').empty();

		const registerHTML = `
			<div class="login">
				<div class="formContainer">
					<div class="form">
						<form class="register-form">
							<input type="text" id="firstName" placeholder="First Name"/>
							<input type="text" id="lastName" placeholder="Last Name"/>
							<input type="email" id="email" placeholder="Email Address"/>
							<input type="password" id="password" placeholder="Password"/>
							<button>create</button>
							<p class="message">Already registered? <a href="#/login">Sign In</a></p>
						</form>
					</div>
				</div>
			</div>
		`;

		$('main').append(registerHTML);
	}

	$('main').on('submit', '.register-form', function() {
		const firstName = $('#firstName').val();
		const lastName = $('#firstName').val();
		const email = $('#email').val();
		const password = $('#password').val();

		createUser(firstName, lastName, email, password);
	});

	function createUser(firstName, lastName, email, password) {
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then(function() {
				console.log('You sucessfully registered!');

				var uid = firebase.auth().currentUser.uid;
				document.cookie = `uid=${uid}`;
				console.log(document.cookie);

				db.collection('users')
					.doc(uid)
					.set({
						firstName: firstName,
						lastName: lastName,
						email: email
					})
					.then(function() {
						console.log('Updated users projects array');

						window.location.assign(`#/start`);
						location.reload();
					})
					.catch(function(error) {
						console.error('Error writing document: ', error);
					});
			})
			.catch(function(error) {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;

				console.log(`User registration error ${errorCode}: ${errorMessage}`);
				// ...
			});
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
		console.log(projectID);
		$('.main').empty();
		loadProject(projectID);
		getProjectList(userID);
		$('.listContainer').sortable();
	}

	function getProjectList(userID) {
		$('.projectNav').empty();

		db.collection('users')
			.doc(userID)
			.get()
			.then(function(doc) {
				const projectList = doc.data().projects;

				for (const project of projectList) {
					db.collection('projects')
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

	// Event listener for creating new project
	$('main').on('keyup', '#newProject', function(e) {
		if (event.key === 'Enter' || event.keyCode === '13') {
			const projectName = $(this).val();

			createProject(projectName, userID);

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

	// Event listener for deleting lists

	$('main').on('click', '.deleteList', function(e) {
		e.preventDefault();

		const listID = $(this)
			.closest('.list')
			.attr('id');

		deleteList(listID);
	});
	// Load all lists and cards + display them in the DOM
	function loadProject(projectID) {
		console.log(projectID);

		db.collection('projects')
			.doc(projectID)
			.get()
			.then(function(res) {
				// Loop through they array of lists and insert in the DOM
				console.log(res.data());

				$('.main').append(
					`
						<div class="projectDetails" id="${projectID}">
							<h1>Project: ${res.data().name}</h1>
							<input
							type="text"
							class="newCard"
							id="newList"
							name="newCard"
							placeholder="Add new list"
						/>
						</div>
						<div class="board">
							
							<div class="listContainer" id="${projectID}">
							</div>
						</div>
					`
				);
				if (res.data().lists != undefined) {
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
												<a class="deleteList" href="#"><i class="fas fa-times"></i></a>
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

								$('.listContainer').sortable();

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
				}
			})
			.catch(function(error) {
				console.log('Error getting documents: ', error);
			});
	}

	// Create new project
	function createProject(projectName, userID) {
		db.collection('projects')
			.add({
				name: projectName
			})
			.then(function(docRef) {
				console.log('Created new project!');

				let newProject = `
										<li class="active">
											<a href="#/project/${docRef.id}" class="projectLink">
												${projectName}
											</a>
										</li>
										`;

				// Add new card markup with dynamic list name
				$(newProject).appendTo('.projectNav');

				window.location.replace(`#/project/${docRef.id}`);

				db.collection('users')
					.doc(userID)
					.update({
						projects: firebase.firestore.FieldValue.arrayUnion(docRef.id)
					})
					.then(function() {
						console.log('Updated user projects array');
					})
					.catch(function(error) {
						console.error('Error writing document: ', error);
					});
			})
			.catch(function(error) {
				console.error('Error writing document: ', error);
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

				createSortableCards();

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
											<a class="deleteList" href="#"><i class="fas fa-times"></i></a>
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
				$(newList).appendTo('.listContainer');

				createSortableList();
				createSortableCards();

				const sortedIDs = $('.listContainer').sortable('toArray');
				console.log(sortedIDs);

				// Update list array in project document
				db.collection('projects')
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
				var sortedIDs = $('.listContainer').sortable('toArray');

				console.log(sortedIDs);

				db.collection('projects')
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

	function deleteList(listID) {
		const projectID = $('.projectDetails').attr('id');

		db.collection('list')
			.doc(listID)
			.delete()
			.then(function() {
				console.log('Document successfully deleted!');

				$(`#${listID}`).remove();

				const sortedIDs = $(`.listContainer`).sortable('toArray');
				console.log(sortedIDs);

				db.collection('projects')
					.doc(projectID)
					.update({ lists: sortedIDs })
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

	// Delete project
});
