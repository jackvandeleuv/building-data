import { ComplaintCarosel } from "../carosels/complaintCarosel.js";
import { DEFAULT_BUILDING_IMG } from "../../config.js";
import { ViolationCarosel } from "../carosels/violationCarosel.js";
import { RentalCarosel } from "../carosels/rentalCarosel.js";
import { SameOwnerParcelCarosel } from "../carosels/sameOwnerParcelCarosel.js";
import { URI } from "../../config.js";

export class ParcelPage {
    // http://localhost:8000/?type=parcel&parcelpin=00234143
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.parcelpin = (params.get("parcelpin") || '').trim();
        this.owner = (params.get("owner") || '').trim();

        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="headerImage" src="${DEFAULT_BUILDING_IMG}" alt="">
            </header>            
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            <div id="parcelCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Rental Registrations At This Parcel</h3>
            <div id="rentalCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Violations At This Parcel</h3>
            <div id="violationCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Complaints About This Parcel</h3>
            <div id="complaintCarosel" class="carosel">
                Loading...
            </div>
        `;

        this.load();
        new SameOwnerParcelCarosel('parcelCarosel', this.owner, this.parcelpin);
        new ComplaintCarosel('complaintCarosel', this.parcelpin);
        new ViolationCarosel('violationCarosel', this.parcelpin);
        new RentalCarosel('rentalCarosel', this.parcelpin);
    }

    async load() {
        const url = `http://localhost:5000/parcel_details/${this.parcelpin}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('content').innerHTML = `Could not load parcel.`;
            return;
        }

        const firstParcel = results[0];

        if (firstParcel.photo_link !== undefined) {
            document.getElementById('headerImage').src = firstParcel.photo_link
        }

        const ownerLink = encodeURI(`${URI}?type=owner&owner=${firstParcel.deeded_owner_clean}`);

        document.getElementById('content').innerHTML = `
            <h1>${firstParcel.parcelpin}</h1>
            <div class="parcelPageSubHeader">${firstParcel.par_addr_all}</div>
            <a 
                href="${ownerLink}"
                class="ownerLink"
            >
                ${firstParcel.deeded_owner_main_alias}
            </a>
            <ul>
                <li>Last Transfer: ${firstParcel.transfer_date}</li>
                <li>2022 Survey Category: ${firstParcel.property_category}</li>
                <li>2022 Survey Use: ${firstParcel.property_use}</li>
                <li>2022 Survey Grade: ${firstParcel.survey_grade_result}</li>
                <li>Same Owner Complaints: ${firstParcel.same_owner_complaints} (Total: ${firstParcel.total_complaints})</li>
                <li>Same Owner Rentals: ${firstParcel.same_owner_rentals} (Total: ${firstParcel.total_rentals})</li>
                <li>Same Owner Violations: ${firstParcel.same_owner_violations} (Total: ${firstParcel.total_violations})</li>
            </ul>
        `;    
    }
}