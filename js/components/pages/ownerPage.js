import { DEFAULT_OWNER_IMG } from "../../config.js";
import { SameOwnerViolationCarosel } from "../carosels/sameOwnerViolationCarosel.js";
import { SameOwnerComplaintCarosel } from "../carosels/sameOwnerComplaintCarosel.js";
import { SameOwnerParcelCarosel } from "../carosels/sameOwnerParcelCarosel.js";
import { SameOwnerRentalCarosel } from "../carosels/sameOwnerRentalCarosel.js";

export class OwnerPage {
    // http://localhost:8000/?type=owner&owner=bob
    constructor() {       
        const params = new URLSearchParams(window.location.search);
        this.owner = (params.get("owner") || '').trim();

        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="headerImage" src="${DEFAULT_OWNER_IMG}" alt="">
            </header>            
            <div class="content" id="content"> 
                <p>Loading...</p>
            </div>
            <hr>
            <h3>Parcels With The Same Owner</h3>
            <div id="sameOwnerParcelCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Code Violations By Same Owner</h3>
            <div id="sameOwnerViolationCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Complaints On The Same Owner</h3>
            <div id="sameOwnerComplaintCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Rental Registrations By Same Owner</h3>
            <div id="sameOwnerRentalCarosel" class="carosel">
                Loading...
            </div>
        `;

        this.loadBody(this.owner);
        new SameOwnerParcelCarosel('sameOwnerParcelCarosel', this.owner, this.parcelpin);
        new SameOwnerRentalCarosel('sameOwnerRentalCarosel', this.owner);
        new SameOwnerComplaintCarosel('sameOwnerComplaintCarosel', this.owner);
        new SameOwnerViolationCarosel('sameOwnerViolationCarosel', this.owner);
    }

    async loadBody() {
        const url = `http://localhost:5000/owner/${this.owner}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('content').innerHTML = `Could not load owner.`;
            return;
        }

        const firstOwner = results[0];
        document.getElementById('content').innerHTML = `
            <h1>${firstOwner.deeded_owner_main_alias}</h1>
            <p class="parcelPageSubHeader">Parcels Owned: ${firstOwner.parcels_owned}</p>
        `;    
    }
}