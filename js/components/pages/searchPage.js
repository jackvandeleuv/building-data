// searchPage.js  – all-Tailwind version with padded cards
import { DEFAULT_BUILDING_IMG, DEFAULT_OWNER_IMG, URI } from '../../config.js';

export class SearchPage {
  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.query = (params.get('q') || '').trim();

    /* ----------  Scaffold ---------- */
    document.getElementById('main').innerHTML = `
      <header class="max-w-4xl mx-auto px-4 pt-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Access Building Data</h1>
        <p class="mt-1 text-gray-500">
          Find building and housing data on Cleveland properties
        </p>
      </header>

      <div class="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div class="flex rounded-lg shadow bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600">
          <input
            id="searchElem"
            role="combobox"
            type="text"
            placeholder="Address, owner, parcel, or record ID"
            class="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <h3 id="resultBoxHeader" class="text-lg font-medium text-gray-700"></h3>

        <div id="resultBox" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${this.query === '' ? '' : '<progress id="progressBar" class="w-full"></progress>'}
        </div>
      </div>
    `;

    /* ----------  Events ---------- */
    document
      .getElementById('searchElem')
      .addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        window.location = encodeURI(`${URI}?type=search&q=${e.currentTarget.value}`);
      });

    if (this.query) this.search(this.query);
  }

  /* ----------  Data fetch / render ---------- */
  async search(query) {
    const response = await fetch(encodeURI(`http://localhost:5000/search/${query}`));
    const results = await response.json();

    if (!results.length) {
      document.getElementById('resultBox').innerHTML =
        '<h3 class="col-span-full text-center text-gray-600">No results.</h3>';
      return;
    }

    let innerHTML = '';
    let i = 0;
    for (const row of results) {
      const maker = {
        parcel: ParcelCard,
        violation: ViolationCard,
        complaint: ComplaintCard,
        rental_registration: RentalCard,
        owner: OwnerCard
      }[row.type];
      if (!maker) continue;
      innerHTML += new maker(row.data, i++).makeHTML();
    }
    document.getElementById('resultBox').innerHTML = innerHTML;
  }
}

/* ----------  Card factory ---------- */
const baseCard = (content, badge, badgeColor) => `
  <a href="${content.url}" class="block p-3 bg-white rounded-lg shadow transition hover:shadow-lg">
    <figure class="relative rounded-md overflow-hidden">
      <img src="${content.img}" alt="" class="w-full h-48 object-cover">
      <span class="absolute top-2 left-2 inline-block rounded px-2 py-0.5 text-xs font-semibold text-white ${badgeColor}">
        ${badge}
      </span>
      ${content.save ?? ''}
    </figure>
    <div class="pt-4">
      ${content.body}
    </div>
  </a>
`;

/* ----------  Individual card components ---------- */
class ParcelCard {
  constructor(d) {
    this.HTML = baseCard(
      {
        url: encodeURI(`${URI}?type=parcel&parcelpin=${d.parcelpin}&owner=${d.deeded_owner_clean}`),
        img: d.photo_link || DEFAULT_BUILDING_IMG,
        save: d.survey_grade_result
          ? `<button aria-label="" class="absolute top-2 right-2 rounded bg-white/80 backdrop-blur px-1.5 text-sm font-medium text-gray-800">${d.survey_grade_result}</button>`
          : '',
        body: `
          <div class="text-lg font-semibold">${d.par_addr_all}</div>
          <p class="text-sm text-indigo-600 truncate">${d.deeded_owner_main_alias || '&nbsp;'}</p>
          <div class="mt-2 text-sm text-gray-500">Parcel: ${d.parcelpin}</div>

          <div class="mt-4 flex justify-between text-center text-sm">
            <div><span class="block text-xl font-bold">${d.total_complaints}</span>Complaints</div>
            <div><span class="block text-xl font-bold">${d.total_violations}</span>Code&nbsp;Violations</div>
            <div><span class="block text-xl font-bold">${d.total_rentals}</span>Rentals</div>
          </div>
        `
      },
      `${d.property_use || ''} Parcel`,
      'bg-indigo-600'
    );
  }
  makeHTML() {
    return this.HTML;
  }
}

class OwnerCard {
  constructor(d) {
    this.HTML = baseCard(
      {
        url: encodeURI(`${URI}?type=owner&owner=${d.deeded_owner_clean}`),
        img: DEFAULT_OWNER_IMG,
        body: `
          <div class="text-lg font-semibold">${d.deeded_owner_main_alias}</div>
          <div class="mt-4 text-center text-sm">
            <span class="block text-xl font-bold">${d.parcels_owned}</span>Parcels&nbsp;Owned
          </div>
        `
      },
      'Owner',
      'bg-blue-600'
    );
  }
  makeHTML() {
    return this.HTML;
  }
}

class ViolationCard {
  constructor(d) {
    this.HTML = baseCard(
      {
        url: encodeURI(
          `${URI}?type=violation&record_id=${d.record_id}&parcelpin=${d.parcelpin}&owner=${d.deeded_owner_clean}`
        ),
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png',
        body: `
          <div class="text-lg font-semibold">${d.record_id}</div>
          <div class="mt-1 text-sm text-gray-500">Type: ${d.type_of_violation}</div>
          <div class="text-sm text-gray-500">Parcel: ${d.parcelpin}</div>
          <div class="text-sm text-gray-500">Address: ${d.par_addr_all}</div>
        `
      },
      'Violation',
      'bg-red-600'
    );
  }
  makeHTML() {
    return this.HTML;
  }
}

class ComplaintCard {
  constructor(d) {
    this.HTML = baseCard(
      {
        url: encodeURI(
          `${URI}?type=complaint&record_id=${d.record_id}&parcelpin=${d.parcelpin}&owner=${d.deeded_owner_clean}`
        ),
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png',
        body: `
          <div class="text-lg font-semibold">${d.record_id}</div>
          <div class="mt-1 text-sm text-gray-500">Type: ${d.type_of_complaint}</div>
          <div class="text-sm text-gray-500">Address: ${d.par_addr_all}</div>
          <div class="text-sm text-gray-500">Parcel: ${d.parcelpin}</div>
        `
      },
      'Complaint',
      'bg-amber-600'
    );
  }
  makeHTML() {
    return this.HTML;
  }
}

class RentalCard {
  constructor(d) {
    this.HTML = baseCard(
      {
        url: encodeURI(
          `${URI}?type=rental&record_id=${d.record_id}&parcelpin=${d.parcelpin}&owner=${d.deeded_owner_clean}`
        ),
        img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Round_Landmark_Icon_House.svg/480px-Round_Landmark_Icon_House.svg.png',
        body: `
          <div class="text-lg font-semibold">${d.record_id}</div>
          <div class="mt-1 text-sm text-gray-500">Owner: ${d.deeded_owner_main_alias}</div>
          <div class="text-sm text-gray-500">Address: ${d.par_addr_all}</div>
          <div class="text-sm text-gray-500">Parcel: ${d.parcelpin}</div>
        `
      },
      'Rental Reg.',
      'bg-purple-600'
    );
  }
  makeHTML() {
    return this.HTML;
  }
}
