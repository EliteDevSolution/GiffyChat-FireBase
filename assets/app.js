var realname;
var realemail;
var curtime;
$(document).ready(function () {

    // initialize Firebase
    initFirebaseAuth();


    var searchTerm;
    // This function fetches the GIFs from Tenor API 
    $('#input-msg').on('change', function (e) {
        if ($(this).val() == '') return;
        $('.imagetmp').css("display", "block");
        testAPI(e);
    });

    $('#input-msg').on('click', function (e) {
        if ($(this).val() == '') return;
        $('.imagetmp').css("display", "block");
        testAPI(e);
    });

    $('#action_menu_btn').click(function(){
        $('.action_menu').toggle();
    });

    $('#msg-content').on('click', function () {
        $('.imagetmp').css("display", "none");
    });

    $('#gif-message-text').on('keypress',function(e) {
        if(e.which == 13) {
            $('#append-gif').click();
        }
    });

    function testAPI(event) {

        event.preventDefault();
        event.stopPropagation();

        var searchTerm = $("#input-msg").val().trim();
        var queryURL = "https://api.tenor.com/v1/search?q=" + searchTerm + "&key=YGY8YR0HQ8YW&limit=5&locale=en_US";
        // queryURLTwo is for the trivial API, deatils for it's functionality to be handled later
        var queryURLTwo = "https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET",
        }).then(function (response) {
            if (!$('.imagetmp').is(':visible')) {
                $('.imagetmp').css("display", "block");
            }
            console.log(response.results[Math.floor(Math.random() * 4)].media[0].tinygif.url);
            console.log(response.results);
            $("#reviewImg").empty();
            for (var i = 0; i < response.results.length; i++) {
                var gifURL = response.results[i].media[0].mediumgif.url;
                var fileName = response.results[i].id;
                $('#reviewImg').append('<img class=\'img-item\'  src="' + gifURL + '" data-idx="' + fileName + '" onclick=\'javascript:sendGIF(this)\' />');
            }

        })
    };



    //handles signin on click function
    $('#loginBtn').on('click', signIn)

    //handles signout on click function
    $('#logoutBtn').on('click', signOut)

    //handles submit buttons
    $('#signUpBtn').on('click', handlesignUpBtnClick)
    // This function adds a selected GIF from the thumbnail column to the message box to be seen
    // By all members of the chat.

    // $(document).on("click", "#add-gif", testAPI);
    // $(document).on("click", ".gif-thumb", sendGIF);
    
});


//function to handlesignUpBtnClick
function handlesignUpBtnClick() {
    event.preventDefault()
    var userName = $('#userName').val().trim();
    var email = userName + '@rhahekel.com';
    var password = $('#inputPassword1').val().trim();
    var password2 = $('#inputPassword2').val().trim();
    var hasError = false;
    if (validateForm(userName, password, password2)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            //var errorCode = error.code;
            var errorMessage = error.message;
            alertMessage(errorMessage);
        }).then(addToDatabase)

        //function to update the database 
        function addToDatabase() {
            if (!hasError) {
                console.log(3, hasError);
                database = firebase.database();
                var setUserListRef = database.ref(`userList`);
                setUserListRef.push({
                    "userName": userName,
                    "lastSpoken": ["null"],
                    "favoritePlayer": ["null"]
                })
            }
        }
    }
};
//function to handle the form and verify if the form filled properly or not 
function validateForm(userName, password, password2) {
    var validForm = true;
    var alphanumeric = /^[a-zA-Z0-9]+$/
    if (password !== password2) {
        validForm = false;
        alertMessage('Password does not match');
    }
    else if (!userName.match(alphanumeric)) {
        validForm = false;
        alertMessage('Username can only be alphanumeric');
    } else if (userName.lenght === 0) {
        validForm = false;

    } else if (password.lenght === 0) {
        validForm = false;

    }

    return validForm;
};


//function that allows users to be able to sign in 
function signIn() {
    event.preventDefault()
    var email = $('#emailInput').val().trim() + '@rhahekel.com';
    var password = $('#passwordInput').val().trim();
    console.log(email)
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        alertMessage(errorMessage);
        // ...
    });
    //   $('#loginDropdown').hide();
}

//function that allows users to be able to sign out
function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
        var errorMessage = error.message;
        alertMessage(errorMessage);
    });
    location.reload();
}

// Triggers when the auth  **user** state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    if (user) {
        console.log('hey')
        // User is signed in.
        displayUserAvailable(user);
        $('#userLogSection').hide();
        $('#midSection').show();
        $('#logoutBtn').show();
        $('#loginDropdown').hide();
        $('#dropdownMenu1').hide();
        $('#input-msg').focus();
    } else {
        // No user is signed in. user is signout
    }
};

// Initiate Firebase Auth.
function initFirebaseAuth() {
    // Listen to auth **user** state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
}

//function to alert messages when it encounters an error
function alertMessage(errorMessage) {
    $('#alertMessage').html(errorMessage)
    $('#alertMessage').show();
}

//functoin to display allUser available to play with
function displayUserAvailable(user) {
    var currentUser = user.email.split('@')[0];
    realname = currentUser;
    $('#realusername').text(realname);
    var database = firebase.database();
    var userListRef = database.ref(`userList`)
    userListRef.orderByChild(`userName`).on(`child_added`, function (data, prevChildKey) {
        var allOtherUser = data.val();
        var databaseUsername = allOtherUser.userName;
        var currentUser = user.email.split('@')[0];
        if (currentUser != databaseUsername) {

            var htmlText = `<li>
                            <div class="d-flex bd-highlight">
                                <div class="img_cont">
                                    <img src="https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg" class="rounded-circle user_img">
                                    <span class="online_icon"></span>
                                </div>
                                <div class="user_info">
                                    <span>${databaseUsername}</span>
                                    <p>Sahar left 7 mins ago</p>
                                </div>
                            </div>
                        </li>`;                        
            $(`#userListSection`).append(htmlText);
 

            //LEAVE IT HERE I WILL USE IT LATER ///
            //setting up a listener on all buttons 
            // $(`#allOtherUser-${databaseUsername}`).on('click', function () {
            //     handlePlayerUserNameBtnClick(currentUser, databaseUsername);
            // })
        }
    })
};

var sendItem;
function sendGIF(item) {
    sendItem = item;
    var src = $(item).attr('src');
    var imgtag = '<img class="img-msg-item" src="' + src + '" />';
    var htmlText = `<div class="d-flex justify-content-center mb-4">
                                <div class="msg_cotainer">
                                   <div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">
                                    ${imgtag}
                                    </div><div class="flip-card-back"><h1> ... </h1></div></div></div>
                                    <span class="msg_time">8:40 AM, Today</span>
                                </div>
                            </div>`;

    $('#gifModal').modal('show');
    $('#gif-preview').html(htmlText);   
};

function timeNow() {
  var currentDate = new Date(),
    h = (currentDate.getHours()<10?'0':'') + currentDate.getHours(),
    m = (currentDate.getMinutes()<10?'0':'') + currentDate.getMinutes();
  var date = currentDate.getDate();
  var month = currentDate.getMonth(); //Be careful! January is 0 not 1
  var year = currentDate.getFullYear();
  curtime =curtime = h + ':' + m + '  ' +  year + "-" +(month + 1) + "-" + date;
}

$('#append-gif').on('click', function(evt)
{   
    var hiddenMsg = $("#gif-message-text").val();
    var src = $(sendItem).attr('src');
    timeNow();
    var imgtag = '<img class="img-msg-item" src="' + src + '" />';
    var htmlText = `<div class="d-flex justify-content-start mb-4">
                                <div class="img_cont_msg">
                                    <img src="https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg" class="rounded-circle user_img_msg">
                                </div>
                                <div class="msg_cotainer">
                                   <div class="flip-card"><div class="flip-card-inner"><div class="flip-card-front">
                                    ${imgtag}
                                    </div><div class="flip-card-back"><h3> ${realname} says:</h3>
                                    <p style='color: rgb(249, 255, 0); background-color: #2980b9;'>${hiddenMsg}</p>
                                    </div></div></div>
                                    <span class="msg_time">${curtime}</span>
                                </div>
                            </div>`;
     $('#msg-content').append(htmlText);                            
     $("#gif-message-text").val("");
     $('#gifModal').modal('toggle');
     autoScroll();
});

$(".modal").on('shown.bs.modal', function () {
    $('#gif-message-text').focus();
});

function autoScroll() {
    setTimeout(function () {
        var cc = $('#msg-content');
        var dd = cc[0].scrollHeight;
        cc.animate({
            scrollTop: dd
        }, 500);
    }, 1000);
}