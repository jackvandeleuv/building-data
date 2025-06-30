import { WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ComplaintCarosel } from "./complaintCarosel.js";
import { ParcelBody } from "./parcelBody.js";
import { ViolationCarosel } from "./violationCarosel.js";
import { ParcelCarosel } from "./parcelCarosel.js";
import { getParcelImage } from "../utils/utils.js";

export class ParcelPage {
    // http://localhost:8000/?type=parcel&parcelpin=00234143
    constructor() {       
        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="headerImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
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

        const params = new URLSearchParams(window.location.search);
        this.parcelpin = params.get("parcelpin");

        this.__parcelBody = new ParcelBody('content');

        this.__rentalCarosel = new RentalCarosel('rentalCarosel');
        this.__complaintCarosel = new ComplaintCarosel('complaintCarosel');
        this.__violationCarosel = new ViolationCarosel('violationCarosel');
        this.__parcelCarosel = new ParcelCarosel('parcelCarosel');

        getParcelImage('headerImage', this.parcelpin);
        this.__parcelBody.load(this.renderCarosels, [new WhereClause('survey_parcel', this.parcelpin)]);
        this.__rentalCarosel.load((() => {}), [new WhereClause('DW_Parcel', this.parcelpin)]);
        this.__complaintCarosel.load((() => {}), [new WhereClause('DW_Parcel', this.parcelpin)]);
        this.__violationCarosel.load((() => {}), [new WhereClause('DW_Parcel', this.parcelpin)]);
    }

    renderCarosels = () => {
        if (!this.__parcelBody.isLoaded()) {
            console.error('Could not load parcel.');
            return;
        }
        
        const owner = this.__parcelBody.owner;

        this.__parcelCarosel.load((() => {}), [new WhereClause('parcel_owner', owner)]);
    }
}