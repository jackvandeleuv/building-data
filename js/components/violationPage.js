import { WhereClause } from "../fetchEsri.js";
import { RentalCarosel } from "./rentalCarosel.js";
import { ComplaintCarosel } from "./complaintCarosel.js";
import { ViolationBody } from "./violationBody.js";

export class ViolationPage {
    // http://localhost:8000/?type=violation&record_id=V18037037
    constructor() {       
        document.getElementById('main').innerHTML = `
            <header class="parcelPageBanner">
                <a href="javascript:history.back()" class="back-btn" aria-label="Go back"><</a>
                <img id="parcelPageImage" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Archean.png/1024px-Archean.png" alt="">
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
            <h3>Complaints About This Parcel</h3>
            <div id="complaintCarosel" class="carosel">
                Loading...
            </div>
        `;

        const params = new URLSearchParams(window.location.search);
        this.record_id = params.get("record_id");

        const filterStatements = [new WhereClause('RECORD_ID', this.record_id)];

        this.__violationBody = new ViolationBody('content');

        this.__rentalCarosel = new RentalCarosel('rentalCarosel');
        this.__complaintCarosel = new ComplaintCarosel('complaintCarosel');

        this.__violationBody.load(this.renderCarosels, filterStatements);
    }

    renderCarosels = () => {
        if (!this.__violationBody.isLoaded()) {
            console.error('Could not load complaint.');
            return;
        }
        
        const parcel = this.__violationBody.parcel;

        this.__rentalCarosel.load((() => {}), [new WhereClause('DW_Parcel', parcel)]);
        this.__complaintCarosel.load((() => {}), [new WhereClause('DW_Parcel', parcel)]);
    }
}