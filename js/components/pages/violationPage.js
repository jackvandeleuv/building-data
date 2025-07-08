import { DEFAULT_BUILDING_IMG } from "../../config.js";
import { RentalCarosel } from "../carosels/rentalCarosel.js";
import { ComplaintCarosel } from "../carosels/complaintCarosel.js";
import { SameOwnerParcelCarosel } from "../carosels/sameOwnerParcelCarosel.js";
import { URI } from "../../config.js";
import { daysAgoLabel } from "../../utils.js";

export class ViolationPage {
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
            <h3>Rental Registrations At This Parcel</h3>
            <div id="rentalCarosel" class="carosel">
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
        new RentalCarosel('rentalCarosel', this.parcelpin);
    }

    async load() {
        const url = `http://localhost:5000/violation_details/${this.record_id}`;
        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('content').innerHTML = `Could not load violation.`;
            return;
        }

        const firstRow = results[0];

        if (firstRow.photo_link !== undefined) {
            document.getElementById('headerImage').src = firstRow.photo_link
        }

        const ownerLink = encodeURI(`${URI}?type=owner&owner=${firstRow.deeded_owner_clean}`);

        let cardHTML = '';
        for (const row of results) {
            cardHTML = cardHTML + this.makeCard(row)
        }

        document.getElementById('content').innerHTML = `
            <h1>${firstRow.parcelpin}</h1>
            <div class="parcelPageSubHeader">${firstRow.par_addr_all}</div>
            <a 
                href="${ownerLink}"
                class="ownerLink"
            >
                ${firstRow.deeded_owner_main_alias}
            </a>
            <hr>
            <h2>Status History For This Complaint</h2>
            <div>
                ${cardHTML}
            </div>
        `;    
    }

    makeCard(row) {
        const task = row.task_name;	

        let color = '';
        if (task === 'Application Acceptance') {
            color = '#B3E5FC'
        } else if (task === 'Closure') {
            color = '#C8E6C9'
        } else if (task === 'Condemnation') {
            color = '#FFCDD2'
        } else if (task === 'Demolition Approval') {
            color = '#FFE0B2'
        } else if (task === 'Inspection') {
            color = '#D1C4E9'
        } else if (task === 'Non-Condemnation') {
            color = '#F0F4C3'
        } else if (task === 'Prosecution') {
            color = '#F8BBD0'
        } else if (task === 'Search Warrant') {
            color = '#B2DFDB'
        } else {
            color = '#a6a09b'
        }

        return `
            <div class="complaintHistoryCard">
                <p>
                    <b style="background-color: ${color}">${row.task_name}</b> 
                </p>
                <p>
                    ${daysAgoLabel(new Date(row.task_date))} &mdash; ${row.task_status}
                </p>
            </div>
        `;
    }
}