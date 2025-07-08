import { DEFAULT_BUILDING_IMG, DEFAULT_OWNER_IMG, URI } from '../../config.js';

export class SearchPage {
    constructor() {
        const params = new URLSearchParams(window.location.search);
        this.query = (params.get("q") || '').trim();

        document.getElementById('main').innerHTML = `
            <header class="page-header">
                <h1>Access Building Data</h1>
                <p class="subtitle">Find building and housing data on Cleveland properties</p>
            </header>

            <div class="searchPageMainBox">
                <div class="searchbox">
                    <input 
                        type="text" 
                        role="combobox" 
                        placeholder="Address, owner, parcel, or record ID"
                        value="" 
                        id="searchElem"
                    >
                </div>
                <h3 id="resultBoxHeader"></h3>
                <div class="resultBox" id="resultBox">
                    ${this.query === '' ? '' : '<progress id="progressBar"></progress>'}
                </div>
            </div>
        `;

        document.getElementById('searchElem').addEventListener('keydown', (async (e) => {
            if (e.key !== 'Enter') return;
            window.location = encodeURI(`${URI}?type=search&q=${e.currentTarget.value}`);
        }));

        if (this.query === '') {
            return;
        }

        this.search(this.query)
    }

    async search(query) {
        const url = `http://localhost:5000/search/${query}`;

        const response = await fetch(encodeURI(url));
        const results = await response.json();

        if (results.length === 0) {
            document.getElementById('resultBox').innerHTML = '<h3>No results.</h3>';
            return;
        }

        let innerHTML = '';
        let i = 0;
        for (const row of results) {
            let card = {};
            if (row.type === 'parcel') {
                card = new ParcelCard(row.data, i++);
            } else if (row.type === 'violation') {
                card = new ViolationCard(row.data, i++);
            } else if (row.type === 'complaint') {
                card = new ComplaintCard(row.data, i++);
            } else if (row.type === 'rental_registration') {
                card = new RentalCard(row.data, i++);
            } else if (row.type === 'owner') {
                card = new OwnerCard(row.data, i++);
            } else {
                console.error('Unrecognized search result type.')
                continue
            }
            innerHTML = innerHTML + card.makeHTML();
        }

        document.getElementById('resultBox').innerHTML = innerHTML;
    }
}
            
class ParcelCard {
    constructor(data, index) {
        const parcelpin = data.parcelpin || '';
        const owner = data.deeded_owner_clean || '';
        const url = encodeURI(`${URI}?type=parcel&parcelpin=${parcelpin}&owner=${owner}`);
        this.HTML = `
            <a class="card" href="${url}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="${data.photo_link || DEFAULT_BUILDING_IMG}">
                    <span class="badge">${data.property_use || ''} Parcel</span>
                    <button class="save" aria-label="">
                        ${data.survey_grade_result || ''}
                    </button>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.par_addr_all}</div>
                    <p class="ownerLink">
                        ${data.deeded_owner_main_alias}
                    </p>
                    <div class="address">Parcel: ${data.parcelpin}</div>
    
                    <div class="inventory">
                        <div class="inv">
                            <strong id="violationSubHeader_${index}">${data.total_complaints}</strong>
                            <small>Complaints</small>
                        </div>
                        <div class="inv">
                            <strong id="violationSubHeader_${index}">${data.total_violations}</strong>
                            <small>Code Violations</small>
                        </div>
                        <div class="inv">
                            <strong id="rentalSubHeader_${index}">${data.total_rentals}</strong>
                            <small>Rental Registrations</small>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class OwnerCard {
    constructor(data, index) {
        this.HTML = `
             <a class="card" href="${encodeURI(URI + '?type=owner&owner=' + data.deeded_owner_clean) || ''}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="${DEFAULT_OWNER_IMG}">
                    <span class="badge" style="background-color: blue">Owner</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.deeded_owner_main_alias}</div>
    
                    <div class="inventory">
                        <div class="inv">
                            <strong id="ownerSubHeader_${index}">${data.parcels_owned}</strong>
                            <small>Parcels Owned</small>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class ViolationCard {
    constructor(data, index) {
        const parcelpin = data.parcelpin || '';
        const owner = data.deeded_owner_clean || '';
        const record_id = data.record_id || '';
        const url = encodeURI(`${URI}?type=violation&record_id=${record_id}&parcelpin=${parcelpin}&owner=${owner}`);

        this.HTML = `
            <a class="card" href="${url}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: red">Violation</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.record_id}</div>
                    <div class="address">Type of Violation: ${data.type_of_violation}</div>
                    <div class="address">Parcel: ${data.parcelpin}</div>
                    <div class="address">Property Address: ${data.par_addr_all}</div>

                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class ComplaintCard {
    constructor(data, index) {
        const parcelpin = data.parcelpin || '';
        const owner = data.deeded_owner_clean || '';
        const record_id = data.record_id || '';
        const url = encodeURI(`${URI}?type=complaint&record_id=${record_id}&parcelpin=${parcelpin}&owner=${owner}`);

        this.HTML = `
            <a class="card" href="${url}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: chocolate">Complaint</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.record_id}</div>
                    <div class="address">Type of Complaint: ${data.type_of_complaint}</div>
                    <div class="address">Property Address: ${data.par_addr_all}</div>
                    <div class="address">Parcel: ${data.parcelpin}</div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}

class RentalCard {
    constructor(data, index) {
        const parcelpin = data.parcelpin || '';
        const owner = data.deeded_owner_clean || '';
        const record_id = data.record_id || '';
        const url = encodeURI(`${URI}?type=rental&record_id=${record_id}&parcelpin=${parcelpin}&owner=${owner}`);

        this.HTML = `
            <a class="card" href="${url}">
                <figure class="card__photo">
                    <img id="rentalCardImage_${index}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png">
                    <span class="badge" style="background-color: purple">Rental Registration</span>
                </figure>
    
                <div class="body">
                    <div class="survey-line">${data.record_id}</div>
                    <div class="address">Owner Org Name: ${data.deeded_owner_main_alias}</div>
                    <div class="address">Property Address: ${data.par_addr_all}</div>
                    <div class="address">Parcel: ${data.parcelpin}</div>
                </div>
            </a>
        `;
    }

    makeHTML() {
        return this.HTML;
    }
}
