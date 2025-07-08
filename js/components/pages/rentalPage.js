import { DEFAULT_BUILDING_IMG } from "../../config.js";
import { ComplaintCarosel } from "../carosels/complaintCarosel.js";
import { ViolationCarosel } from "../carosels/violationCarosel.js";
import { SameOwnerParcelCarosel } from "../carosels/sameOwnerParcelCarosel.js";
import { URI } from "../../config.js";
import { daysAgoLabel } from "../../utils.js";

export class RentalPage {
    // http://localhost:8000/?type=parcel&parcelpin=00234143
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.record_id = (params.get("record_id") || '').trim();
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
            <div id="sameOwnerParcelsCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Violations At This Parcel</h3>
            <div id="violationCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Complaints On This Parcel</h3>
            <div id="complaintCarosel" class="carosel">
                Loading...
            </div>
        `;

        this.load();
        new SameOwnerParcelCarosel('sameOwnerParcelsCarosel', this.owner);
        new ComplaintCarosel('complaintCarosel', this.parcelpin);
        new ViolationCarosel('violationCarosel', this.parcelpin);
    }

    async load() {
        const url = `http://localhost:5000/rental_details/${this.record_id}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('content').innerHTML = `Could not load rental registration.`;
            return;
        }

        const firstRow = results[0];

        if (firstRow.photo_link !== undefined) {
            document.getElementById('headerImage').src = firstRow.photo_link
        }

        const ownerLink = encodeURI(`${URI}?type=owner&owner=${firstRow.deeded_owner_clean}`);

        document.getElementById('content').innerHTML = `
            <h1>${firstRow.parcelpin}</h1>
            <div class="parcelPageSubHeader">${firstRow.par_addr_all}</div>
            <a 
                href="${ownerLink}"
                class="ownerLink"
            >
                ${firstRow.deeded_owner_main_alias}
            </a>
            <ul>
                <li>File Date: ${firstRow.file_date}</li>
                <li>Status: ${firstRow.status}</li>
                <li>Status Date: ${firstRow.status_date}</li>
                <li>Units: ${firstRow.units}</li>
            </ul>
        `;    
    }

}