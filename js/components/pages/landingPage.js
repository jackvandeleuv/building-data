import { URI } from '../../config.js';

export class LandingPage {
    constructor() {
        document.getElementById('main').innerHTML = `
            <div class="landing-page">
            <div class="landing-card">
                <header class="landing-header">
                <h1>Access Building Data</h1>
                <p class="landing-subtitle">
                    Find building and housing data on Cleveland properties
                </p>
                </header>

                <div class="landing-search">
                <input
                    type="text"
                    role="combobox"
                    placeholder="Address, owner, parcel, or record ID"
                    id="searchElem"
                />
                </div>
            </div>
            </div>
        `;

        document.getElementById('searchElem').addEventListener('keydown', (async (e) => {
            if (e.key !== 'Enter') return;
            window.location = encodeURI(`${URI}?type=search&q=${e.currentTarget.value}`);
        }));

    }
}