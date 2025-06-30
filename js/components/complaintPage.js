import { WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ViolationCarosel } from "./violationCarosel.js";
import { ComplaintBody } from "./complaintBody.js";
import { getParcelImage } from "../utils/utils.js";

export class ComplaintPage {
    // http://localhost:8000/?type=complaint&record_id=CMP17024869
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
            <h3>Rental Registrations At This Parcel</h3>
            <div id="rentalCarosel" class="carosel">
                Loading...
            </div>
            <hr>
            <h3>Violations About This Parcel</h3>
            <div id="violationCarosel" class="carosel">
                Loading...
            </div>
        `;

        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('PERMIT_ID', this.record_id)];

        this.__complaintBody = new ComplaintBody('content');

        this.__rentalCarosel = new RentalCarosel('rentalCarosel');
        this.__violationCarosel = new ViolationCarosel('violationCarosel');

        this.__complaintBody.load(this.renderCarosels, filterStatements);
    }

    renderCarosels = () => {
        if (!this.__complaintBody.isLoaded()) {
            console.error('Could not load complaint.');
            return;
        }
        
        const parcel = this.__complaintBody.parcel;

        getParcelImage('headerImage', parcel);
        this.__rentalCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
        this.__violationCarosel.load(() => {}, [new WhereClause('DW_Parcel', parcel)]);
    }
}
