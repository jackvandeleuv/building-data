class ResultPage {
    constructor(recordID) {
        console.log(recordID)
        this.recordID = recordID;
    }

    async loadRecord() {
        const params = new URLSearchParams({ 
            outFields: '*',
            where: `RECORD_ID like '%${this.recordID}%'`
        });

        const url = `https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query?${params}&f=json`;

        const result = await fetch(url);

        const resultJSON = await result.json();
        if (resultJSON.error !== undefined) {
            console.error(resultJSON.error.message);
            return;
        }

        const data = resultJSON.features.map((row) => row.attributes);

        return data;
    }

    makeCardTemplate(row) {
        return `                
            <div class="item completed space-y-4">
                <div class="row flex justify-between gap-4 cursor-pointer"
                    onclick="this.parentElement.classList.toggle('open')">
                <div class="flex-1">
                    <p class="m-0 font-semibold text-sm text-[#0f193c]">${row.TASK_NAME}</p>
                    <p class="m-0 text-sm font-semibold">
                    ${new Date(row.TASK_DATE)}<sup class="text-[.6em]">th</sup> — 
                    <span class="text-[#23a555]">${row.TASK_STATUS}</span>
                    </p>
                </div>

                <span class="bullet flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                            border-2 border-[#8994b1] transition-transform">
                    <svg class="h-3 w-3 -translate-y-[1px] text-[#8994b1] pointer-events-none"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                        stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9l6 6 6-6" />
                    </svg>
                </span>
                </div>
            </div>
        `;
    }
        
    async makeHTML() { 
        const data = await this.loadRecord();
        console.log(data);

        return `
            <div class="w-[340px] rounded-2xl bg-white shadow-[0_8px_26px_rgba(0,0,0,.05)] px-8 pt-8 pb-10">
                <h2 class="m-0 text-[1.4rem] font-bold leading-tight text-[#0f193c]">
                New Fairfax Multifamily<br>Building
                </h2>
                <p class="mt-[.2rem] mb-6 text-[.82rem] italic font-medium text-[#8994b1]">
                PRJ-25-001796
                </p>

                <div class="space-y-6">

                ${data.map((row) => this.makeCardTemplate(row))}

                <div class="item inprog space-y-4">
                    <div class="row flex justify-between gap-4 cursor-pointer"
                        onclick="this.parentElement.classList.toggle('open')">
                    <div class="flex-1">
                        <p class="m-0 font-semibold text-sm text-[#0f193c]">Site Plan Reviews</p>
                        <p class="m-0 text-sm font-semibold">
                        April&nbsp;29<sup class="text-[.6em]">th</sup> — 
                        <span class="text-[#c13e3e]">In&nbsp;Progress</span>
                        </p>
                    </div>

                    <span class="bullet flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                                border-2 border-[#8994b1] transition-transform">
                        <svg class="h-3 w-3 -translate-y-[1px] text-[#8994b1] pointer-events-none"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                            stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6" />
                        </svg>
                    </span>
                    </div>

                    <div class="panel hidden rounded-[20px] bg-[#2f326b] p-5 text-[.88rem] leading-tight text-white space-y-4">
                    <p><strong class="font-semibold italic">Site Plan Reviews</strong> include both technical
                        and aesthetic reviews of a project’s site impact. This includes PetBOT, Zoning, Planning,
                        and Landmarks reviews as applicable. For contacts, see below.</p>
                    <p>PetBOT: Zachary Miller<br>(218) 664-2182</p>
                    <p>Zoning: Shannan Leonard<br>(218) 664-3814</p>
                    <p>Planning: Myla Moss<br>(218) 664-2757</p>
                    <p>Landmarks: Jessica Beam<br>(218) 664-2151</p>
                    </div>
                </div>

                <div class="item upnext space-y-6">
                    <div>
                    <p class="m-0 font-semibold text-sm text-[#0f193c]">Building Code Review</p>
                    <p class="m-0 text-sm font-semibold text-[#8994b1]">Up Next</p>
                    </div>
                    <div>
                    <p class="m-0 font-semibold text-sm text-[#0f193c]">Plans Coordination</p>
                    <p class="m-0 text-sm font-semibold text-[#8994b1]">Up Next</p>
                    </div>
                    <div>
                    <p class="m-0 font-semibold text-sm text-[#0f193c]">Permit Issuance</p>
                    <p class="m-0 text-sm font-semibold text-[#8994b1]">Up Next</p>
                    </div>
                </div>

                </div>
            </div>
        `;
    }
}

async function getResults(query) {
    const params = new URLSearchParams({ 
        outFields: 'PRIMARY_ADDRESS,RECORD_ID',
        // resultRecordCount: 1000,
        where: `RECORD_ID like '%${query}%' or PRIMARY_ADDRESS like '%${query}%'`
    });

    const url = `https://services3.arcgis.com/dty2kHktVXHrqO8i/arcgis/rest/services/Violation_Status_History/FeatureServer/0/query?${params}&f=json`;

    const result = await fetch(url);

    const resultJSON = await result.json();
    if (resultJSON.error !== undefined) {
        console.error(resultJSON.error.message);
        return;
    }

    const data = resultJSON.features.map((row) => row.attributes);

    return data;
}

async function search(query) {
    renderSkeleton();
    const resultsPromise = getResults(query);
    const results = await resultsPromise;
    const resultSet = new Set();
    const dedupedResults = [];
    for (const result of results) {
        if (resultSet.has(result.RECORD_ID)) continue;
        resultSet.add(result.RECORD_ID);
        dedupedResults.push(result);
    }
    render(dedupedResults);
}

const searchEl  = document.getElementById("search");

function renderSkeleton() {
    const resultsEl = document.getElementById("results");
    resultsEl.innerHTML = 'Loading...';
}

async function render(list) {
    const resultsEl = document.getElementById("results");

    if (list.length === 0) {
        resultsEl.innerHTML = 'No results.';
        return;
    }

    resultsEl.innerHTML = '';

    for (const elem of list) {
        const card = document.createElement('li');
        card.classList = `
            relative my-3 rounded-lg bg-white p-5 pl-6 shadow transition
            hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-xl
            border-l-4 border-transparent hover:border-indigo-400 cursor-pointer
        `;

        card.innerHTML = `
            <h3 class="m-0 text-xl font-bold text-slate-900">${elem.PRIMARY_ADDRESS}</h3>
            <div class="mt-1 italic">${elem.RECORD_ID}</div>
        `;

        card.addEventListener('click', async () => {
            const page = new ResultPage(elem.RECORD_ID); 
            document.getElementById('main').innerHTML = await page.makeHTML();
        });

        resultsEl.appendChild(card);
    }
}

function filter(term) {
    term = term.trim().toLowerCase();
    if (!term) return [];
    return projects.filter(
    p =>
        p.title.toLowerCase().includes(term) ||
        p.record.toLowerCase().includes(term)
    );
}

searchEl.addEventListener("keydown", e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    search(e.target.value);
});

// document.querySelectorAll('.item .row').forEach(row=>{
//     row.addEventListener('click',()=>{
//     const item=row.parentElement;

//     if(item.classList.contains('upnext')) return;
//     item.classList.toggle('open');

//     const panel=item.querySelector('.panel');
//     if(panel) panel.classList.toggle('hidden');

//     const bullet=item.querySelector('.bullet');
//     bullet.classList.toggle('rotate-180');
//     });
// });