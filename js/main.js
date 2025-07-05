import { RentalPage } from "./components/rental/rentalPage.js";
import { ComplaintPage } from "./components/complaint/complaintPage.js";
import { ViolationPage } from "./components/violation/violationPage.js";
import { ParcelPage } from "./components/parcel/parcelPage.js";
import { SearchPage } from "./components/search/searchPage.js";

function main() {
    const params = new URLSearchParams(window.location.search);
    const pageType = params.get("type") || 'search';

    if (pageType === 'search') {
        new SearchPage();
    } else if (pageType === 'parcel') {
        new ParcelPage();
    } else if (pageType === 'rental') {
        new RentalPage();
    } else if (pageType === 'complaint') {
        new ComplaintPage();
    } else if (pageType === 'violation') {
        new ViolationPage();
    }
}

main();
