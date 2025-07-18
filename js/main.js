// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // 👉 CONTACT FORM SUBMISSION – now lets the form post normally
  const form = document.querySelector(".contact-form");
  if (form) {
    // Remove the e.preventDefault() so the browser will follow the <form action="…"> target
    // form.addEventListener("submit", (e) => {
    //   e.preventDefault();
    //   alert("Thanks for reaching out! We’ll be in touch soon to schedule your dog waste removal.");
    //   form.reset();
    // });

    // Optional: you can still show a quick alert _after_ successful PHP redirect, 
    // or handle success inside thank-you.html, so we drop the JS handler here.
  }

  // ✅ HAMBURGER MENU TOGGLE
  const hamburger = document.querySelector(".hamburger");
  const navMenu   = document.querySelector(".nav-links ul");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // ✅ DROPDOWN TOGGLE FOR "Areas We Serve" LINK
  const dropdownToggle = document.querySelector(".dropdown > a");
  const dropdownMenu   = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.preventDefault();           // keep this for dropdown behavior
      dropdownMenu.classList.toggle("show");
    });
  }

  // ✅ Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInsideDropdown = e.target.closest(".dropdown");
    if (!isClickInsideDropdown && dropdownMenu) {
      dropdownMenu.classList.remove("show");
    }
  });
});


