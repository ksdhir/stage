// include your styles like this
import "../styles/offline-page.css";
import "../styles/index.css";
import "../styles/profile.css";

import { db, auth, onAuthStateChanged } from "../modules/firebase.js";
import { loggingOut, userState } from "../modules/user.js";
import { whereAmI } from "../modules/geolocation.js";
import { addOfflineSupport } from "../modules/offline";

import { userName } from "../modules/user.js"

// import queries
// import { addProfile } from "../query/userProfile.js";

if (process.env.NODE_ENV == "production") {
  if ("serviceWorker" in navigator) {
    // console.log(process.env.NODE_ENV);
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/service-worker.js");
    });
  }
}

const logOutBtn = document.querySelectorAll(".logOutBtn");
logOutBtn.forEach((logout) => {
  logout.addEventListener("click", async () => {
    await loggingOut();
  });
});

console.log("hello from index.js");

// User state (logged In or Logged Out)/////////////
let uid;
async function userStatus() {
  uid = await userState();
  console.log("This is the uid!", uid);
}

window.addEventListener("reload", userStatus());

/////////////////////////////////////////////

// Menu
const menuProfile = document.querySelector(".profile-wrapper");
const menuButton = document.querySelectorAll(".menu-button");
menuButton.forEach((menu) => {
  menu.addEventListener("click", (e) => {
    if (!uid) {
      window.location.href = "/login-modal.html";
    } else {
      menuProfile.classList.toggle("hideMenu");
    }
  });
});

////////////////////////////////////////////////////////////////

// const userState = onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     uid = user.uid;

//     // todo fix this later
//     localStorage.setItem("uid", uid);

//     // merges details or creates a new one in USERS Collection
//     const { displayName, email, photoURL } = user;
//     await addProfile(uid, { displayName, email, photoURL });

//     console.log("active user: ", uid);
//   } else {
//     uid = false;
//     console.log("No user logged!!");
//     console.log(uid);
//   }
// });

addOfflineSupport();

// BUTTON LINKS
const btn_profile = document.querySelector(".btn-profile");
const btn_links = document.querySelectorAll(".link-btn");
const desktop_profile_menu = document.querySelector(".desktop-profile");

const moveTo = function (link) {
  window.location.href = `/${link}.html`;
};

btn_profile.addEventListener("click", () => {
  if (!uid) {
    window.location.href = "/login-modal.html";
  } else {
    desktop_profile_menu.classList.toggle("scaleMenu");
  }
});

window.addEventListener("resize", () => {
  const win = window.matchMedia("(max-width: 650px)");
  if (win.matches) {
    desktop_profile_menu.classList.remove("scaleMenu");
  }
});

btn_links.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!uid) {
      moveTo("login-modal");
      return;
    }
    if (btn.classList.contains("explore")) {
      moveTo("explore");
    }
    if (btn.classList.contains("showcase")) {
      moveTo("showcase");
    }
    if (btn.classList.contains("list-space")) {
      moveTo("list-my-space");
    }
  });
});

/////////////////SLIDER IMAGES////////////////////////////
const carouselSlide = document.querySelector(".carousel-slide");
const carouselImages = document.querySelectorAll(
  ".carousel-slide .video-container"
);

// Buttons
// const prevBtn = document.querySelector("#prevBtn");
// const nextBtn = document.querySelector("#nextBtn");

// FUNCTIONS
// active tabs
const activeTab = function () {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab.classList.contains(`tab-${counter}`)) {
      tab.classList.add("active");
    }
  });
};

// Responsiveness
window.addEventListener("resize", () => {
  carouselSlide.style.transition = "none";
  size = carouselImages[0].clientWidth;
  carouselSlide.style.transform = "translateX(" + -size * counter + "px)";
});

// Counter
// position where to start
let counter = 2;
let size;
activeTab();

// You need to wait until the image is loaded to add the width to the variable (async behaviour)
size = carouselImages[0].clientWidth;
carouselSlide.style.transform = `translateX(${-size * counter}px)`;

// Button Listeners (Keyboard < >)
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowRight") {
    if (counter >= carouselImages.length - 1) return;
    carouselSlide.style.transition = `transform 0.4s ease-in-out`;
    counter++;
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") {
    if (counter <= 0) return;
    carouselSlide.style.transition = `transform 0.4s ease-in-out`;
    counter--;
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
  }
});

// Tabs
const btn_explore = document.querySelector(".tab-1");
const btn_showcase = document.querySelector(".tab-2");
const btn_listSpace = document.querySelector(".tab-3");

btn_explore.addEventListener("click", () => {
  if (counter === 1) return;
  counter = 1;
  carouselSlide.style.transition = `transform 0.4s ease-in-out`;
  carouselSlide.style.transform = `translateX(${-size * counter}px)`;
});

btn_showcase.addEventListener("click", () => {
  counter = 2;
  carouselSlide.style.transition = `transform 0.4s ease-in-out`;
  carouselSlide.style.transform = `translateX(${-size * counter}px)`;
});

btn_listSpace.addEventListener("click", () => {
  counter = 3;
  carouselSlide.style.transition = `transform 0.4s ease-in-out`;
  carouselSlide.style.transform = `translateX(${-size * counter}px)`;
});

// Transition End listeners
// fires up when a transition has completed its animation
// allow you to perform actions after a CSS transition animation has completed.
carouselSlide.addEventListener("transitionend", (e) => {
  // Next slide functionality
  if (carouselImages[counter].id === "lastClone") {
    carouselSlide.style.transition = "none";
    // -2 because there are 2 duplicates
    counter = carouselImages.length - 2;
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
  }
  // Previous slide functionality
  if (carouselImages[counter].id === "firstClone") {
    carouselSlide.style.transition = "none";
    counter = carouselImages.length - counter;
    carouselSlide.style.transform = `translateX(${-size * counter}px)`;
  }
  activeTab();
});


// Patch to hide transition
setTimeout(() => {
  const headerprofileWrapper = document.querySelector("header .profile-wrapper");
  headerprofileWrapper.classList.remove("hide");
}, 300);



// show user name in header

const transitionNameElement = document.querySelector("#transition-username");
const popupNameElement = document.querySelector("#popup-username");
const transitionDiffElement = document.querySelector(".user-name");

window.addEventListener("DOMContentLoaded", async (event) => {
    // update name in both elements
    const uname = await userName();
    if(uname) {
      popupNameElement.innerHTML = uname;
      transitionNameElement.innerHTML = uname;
      transitionDiffElement.innerHTML = uname;
    } else {
      console.log(popupNameElement)
      popupNameElement.innerHTML = "User Name";
      transitionNameElement.innerHTML = "User Name";
      transitionDiffElement.innerHTML = "User Name";
    }
});
