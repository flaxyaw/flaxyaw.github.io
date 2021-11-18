function pageRedirect() {
  var delay = 1000; // time in milliseconds

  setTimeout(function() {
      window.location = "../../logout";
  }, delay);
}

function logoutmsg() {
  iziToast.success({
      title: '<div style="color: #81ff00">LOGGED OUT</div>',
      message: 'Redirecting in 3 seconds!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function invalidlogindetailsmsg() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Invalid login details!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function loginmsg() {
  iziToast.success({
      title: '<div style="color: #81ff00">LOGGED IN</div>',
      message: 'Redirecting in 2 seconds!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function emailnotregisteredmsg() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Email not registered',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function checkemailmsg() {
  iziToast.success({
      title: '<div style="color: #81ff00">SUCCESS</div>',
      message: 'Check the entered email!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function passworddoesntmatch() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Passwords doesnt match!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function invalidtoken() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Invalid token!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function novalidtokensent() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'No valid token sent!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function passwordhasbeenresetmsg() {
  iziToast.success({
      title: '<div style="color: #81ff00">SUCCESS</div>',
      message: 'Password has been reset!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function invalidpremium() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Invalid premium code!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function activatedpremium() {
  iziToast.success({
      title: '<div style="color: #81ff00">SUCCESS</div>',
      message: 'Activated premium code!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function accountcreated() {
  iziToast.success({
      title: '<div style="color: #81ff00">SUCCESS</div>',
      message: 'Account got created',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function usernameregistered() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Username already registered!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function emailregistered() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Email already registered!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function inviteproblems() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Problems with the invite code!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function invalidinvite() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Invalid invite code or already taken!',
      position: 'topRight', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function refresh() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'Refresh, generated all available images!',
      position: 'topRight',
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

function invaliddownload() {
  iziToast.error({
      title: '<div style="color: red">ERROR</div>',
      message: 'No Secret or Domain set!',
      position: 'topCenter', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
      timeout: 2000,
      close: false,
      icon: false,
      displayMode: 1,
  });
}

$(".button").click(function(e) {
  e.preventDefault();
  $imgURL = $(this).attr("href");
  $(".boat_listing").hide();
  $(".boat_listing").html($imgURL).fadeIn(750);
});