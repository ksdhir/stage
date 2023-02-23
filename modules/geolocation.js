// Container
const usersLoc = document.querySelector(".users-loc");

const getPosition = function () {
    return new Promise(function (resolve, reject) {
        //User's current position
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

const whereAmI = async function () {
    try {
        // === Geo Location ===
        // Here, we don't need an if condition to throw error, since the getPosition() function, throws an error if the Promise has a reject state
        const pos = await getPosition();
        // Get coords
        const { latitude: lat, longitude: lng } = pos.coords;

        // === Reverse Geocoding with an external API
        const resGeo = await fetch(
            `https://geocode.xyz/${lat},${lng}?geoit=json`
        );

        // === Handle errors
        if (!resGeo.ok) {
            throw new Error("Problem getting the location data");
        }
        const dataGeo = await resGeo.json();
        console.log("Current location!", dataGeo);
        const html = `
        <p>City: ${dataGeo.city}</p>
        <p>Province: ${dataGeo.statename}</p>
        <p>Country: ${dataGeo.country}</p>
        <p>Address: #${dataGeo.stnumber} ${dataGeo.staddress}, Zip Code ${dataGeo.postal} </p>
        `;
        usersLoc.innerHTML = "";
        usersLoc.insertAdjacentHTML("beforeend", html);

        return `You are in ${dataGeo.city}, ${dataGeo.country}`;
    } catch (err) {
        console.log(err.message);
        // Reject Promise returned from async function, otherwise it will fulfilled the promise even if it fails in one pointe of the function
        throw err;
    }
};

// Event Listener
const btn_geo = document.querySelector(".btn-geo");
btn_geo.addEventListener("click", whereAmI);