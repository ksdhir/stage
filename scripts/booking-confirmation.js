import "/styles/common-styles.css";
import '/styles/offline-page.css';
import "/styles/booking-confirmation.css";


// import queries
import html2pdf from 'html2pdf.js';
import { propertyFuncion } from "../query/propertylist.js";
import { saveBookingInfo, getBookingInfo, saveMyBooking } from '../query/booking.js';
import { userState } from "../modules/user.js";

// modules
import { addOfflineSupport } from "../modules/offline";

import '/styles/header.css';
import './header.js'

// Global Variables for the file
let BOOKING_OBJ = undefined;
const params = new URLSearchParams(document.location.search);
const bookingInfoBase64 = params.get("bookingInfo");
let toBook = undefined;
let BOOKING_INFO = undefined;

init();



//  ======================= FUNCTIONS and parsers

async function init() {
    // parse url and store variable
    BOOKING_OBJ = parseBase64(bookingInfoBase64)

    const stateWrapper = document.getElementsByClassName("state-wrapper")[0];
    const stageLoader = document.getElementById("stage-loader");
    const bookingInfoWrapper = document.getElementsByClassName("booking-info-wrapper")[0];

    // will book or already booked
    // when it comes from my bookigns page the object should look like -> bookingInfo=base64String({bookingId: 'somebookingid'})
    if (Object.keys(BOOKING_OBJ).length > 1) {
        toBook = true;
        let taxPercent = 5;
        const propertyInfo = await getPropertyInfo(BOOKING_OBJ.propertyId)
        BOOKING_INFO = { ...propertyInfo, ...BOOKING_OBJ, taxPercent };
    } else {
        toBook = false;
        BOOKING_INFO = await readBookingInfo(BOOKING_OBJ.bookingId);
    };

    // Manage state
    stageLoader.classList.add("hide");
    stateWrapper.classList.add("hide");
    bookingInfoWrapper.classList.remove("hide");

    
    addOfflineSupport();

    // show the booking information
    displayBookingInfo(toBook, BOOKING_INFO);

    // register button actions
    registerConfirmBtn();
    registerInvoiceBtn();


}

function parseBase64(base64String) {
    const obj = JSON.parse(atob(base64String))
    return obj;
}

async function getPropertyInfo(propertyId) {
    const propertyInfo = await propertyFuncion(propertyId);
    const addressString = [propertyInfo.address.street, propertyInfo.address.city, propertyInfo.address.state, propertyInfo.address.country].filter(element => element != "").join(', ');
    const primaryPhoto = propertyInfo.media[0] == "" ? "https://picsum.photos/1200/500?random=2" : propertyInfo.media[0];
    const propertyTitle = propertyInfo.propertytitle;
    const bookedAt = getTodayDate();

    return { addressString, primaryPhoto, propertyTitle, bookedAt };
}

async function readBookingInfo(bookingId) {
    const bookingInfo = await getBookingInfo([bookingId]);
    return bookingInfo[bookingId];
}

function getTodayDate() {
    const yourDate = new Date()
    const offset = yourDate.getTimezoneOffset()
    const nDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
    return nDate.toISOString().split('T')[0]
}



// ======================== Register Event Listeners
function registerConfirmBtn() {
    const confirmBtn = document.querySelector("#confirm-btn");
    confirmBtn.addEventListener("click", async () => {
        const bookingId = await saveBookingInfo(BOOKING_INFO);
        // const userId = localStorage.getItem("uid");
        const userId  = await userState();
        const saveMyBookingRsp = await saveMyBooking(userId, bookingId)
        if (saveMyBookingRsp) {
            window.location.href = `${window.location.origin}/booking-confirmation-success.html`
        }
    })
}


function registerInvoiceBtn() {
    const invoiceWrapper = document.querySelector(".booking-information-wrapper");
    const invoiceBtn = document.getElementById("invoice-btn");
    invoiceBtn.addEventListener("click", () => {

        html2pdf()
        .from(invoiceWrapper)
        .set({
            filename: BOOKING_INFO?.propertyTitle + "-invoice",
            html2canvas: {
            // This option is used to remove the "display: none" elements
            // from the PDF
                ignoreElements: (element) => {
                    return element.style.display === 'none' || element.id == "invoice-btn";
                }
            }
        })
        .save();

    })
}




// ======================== DOM Manipulation

function displayBookingInfo(toBook, bookingInfo) {
    if (toBook) {
        const confirmBtn = document.getElementById("confirm-btn");
        confirmBtn.classList.remove("hide");
    } else {
        const invoiceBtn = document.getElementById("invoice-btn");
        invoiceBtn.classList.remove("hide");
    }

    // change image and link
    const imgWrapper = document.querySelector("#property-image");
    const imgAnchor = imgWrapper.children[0];
    const imgElement = imgAnchor.children[0];
    imgAnchor.href = `/property.html?propertyId=${bookingInfo.propertyId}`;
    imgElement.src = bookingInfo.primaryPhoto;

    // change booking details
    // name
    const spaceNameElement = document.getElementById("booking-detail-space-name");
    spaceNameElement.href = `${window.location.origin}/property.html?propertyId=${bookingInfo.propertyId}`;
    spaceNameElement.innerText = bookingInfo.propertyTitle;
    // address and booked at
    const addressElement = document.getElementById("space-address")
    addressElement.innerText = bookingInfo.addressString;
    const bookedAt = document.getElementById("booked-at");
    bookedAt.innerText = bookingInfo.bookedAt;


    // change date details
    const bookedFrom = document.getElementById("booked-from");
    const bookedUpto = document.getElementById("booked-upto");
    const bookedFor = document.getElementById("booked-for");
    bookedFrom.innerText = bookingInfo.dateFrom;
    bookedUpto.innerText = bookingInfo.dateTo;
    bookedFor.innerText = bookingInfo.daysInfo + " days";


    // Price Details
    const basePrice = document.getElementById("base-price");
    basePrice.innerText = "CAD " + bookingInfo.basePrice;

    // conditionally show props
    if (bookingInfo?.equipments?.length) {
        // update the props list
        const propsList = document.querySelector(".detail-props ul");
        propsList.innerHTML = "";

        bookingInfo.equipments.forEach(obj => {
            const string = `<li>
                <span> ${obj.name} </span>
                <span> CAD ${obj.price} </span>
            </li>`
            propsList.innerHTML += string;
        })

        // show  the  props list
        const propsWrapper = document.getElementsByClassName("detail-props")[0];
        propsWrapper.classList.remove("hide");
    }



    const totalPropsPrice = bookingInfo.equipments.map(obj => Number(obj.price)).reduce(function (a, b) { return a + b; }, 0);
    const priceWithProps = Number(bookingInfo.basePrice) + Number(totalPropsPrice);
    const priceForDays = priceWithProps * Number(bookingInfo.daysInfo);

    // dom insertion
    const priceForDaysElem = document.getElementById("price-for-days");
    const priceForDaysValueElem = document.getElementById("price-for-days-value");
    priceForDaysElem.innerHTML = ` Price for ${bookingInfo.daysInfo} days `;
    priceForDaysValueElem.innerHTML = ` ${priceWithProps} x ${bookingInfo.daysInfo} = CAD ${priceForDays} `;


    // calculate tax
    const taxPercent = BOOKING_INFO.taxPercent;
    const taxValue = (Number(priceForDays) * Number(taxPercent)) / 100;

    const taxPropertyElem = document.getElementById("tax-property");
    const taxValueElem = document.getElementById("tax-value");
    taxPropertyElem.innerText = ` GST ${taxPercent}% `;
    taxValueElem.innerText = ` ${priceForDays} x ${taxPercent}% = CAD ${taxValue} `;



    // price with tax
    const finalPrice = priceForDays + taxValue;
    BOOKING_INFO.finalPrice = finalPrice;
    const priceWithTaxElem = document.getElementById("price-with-tax");
    priceWithTaxElem.innerText = ` ${priceForDays} + ${taxValue} = CAD ${finalPrice} `;
}