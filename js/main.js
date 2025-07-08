import { RentalPage } from "./components/pages/rentalPage.js";
import { ComplaintPage } from "./components/pages/complaintPage.js";
import { ViolationPage } from "./components/pages/violationPage.js";
import { ParcelPage } from "./components/pages/parcelPage.js";
import { SearchPage } from "./components/pages/searchPage.js";
import { OwnerPage } from "./components/pages/ownerPage.js";
import { LandingPage } from "./components/pages/landingPage.js";

function main() {
    const params = new URLSearchParams(window.location.search);
    const pageType = params.get("type") || '';

    if (pageType === '') {
        new LandingPage();
    } else if (pageType === 'search') {
        new SearchPage();
    } else if (pageType === 'owner') {
        new OwnerPage();
    } else if (pageType === 'parcel') {
        new ParcelPage();
    } else if (pageType === 'rental') {
        new RentalPage();
    } else if (pageType === 'complaint') {
        new ComplaintPage();
    } else if (pageType === 'violation') {
        new ViolationPage();
    } else {
        document.getElementById('main').innerHTML = '<h1>404: Not Found.</h1>'
    }
}

main();
