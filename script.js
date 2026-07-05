const SHEET_ID = "1ESU-NGsVNWwJ7Ui3REO5FFROdxQ8KkIDQhFYuQXvc-g";
const SHEET_GID = "0";

const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

let rows = [];

function clean(v) {
    if (v === null || v === undefined) return "-";

    // Handles Google Sheets object values
    if (typeof v === "object" && v.v !== undefined) return v.v;

    return v;
}

async function loadData() {
    const res = await fetch(URL);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    rows = json.table.rows;
}

function normalizeStatus(status) {
    const s = String(status).toLowerCase();

    if (s.includes("fixed")) return "🟢 Fixed";
    if (s.includes("in progress")) return "🟡 In Progress";
    if (s.includes("pending")) return "🟠 Pending";
    if (s.includes("returned")) return "🔵 Returned";
    if (s.includes("failed")) return "🔴 Failed";
    if (s.includes("incapable")) return "⚫ Incapable";
    if (s.includes("cancel")) return "⚪ Cancelled";

    return status;
}

function searchJob() {
    const input = document.getElementById("jobInput").value.trim();
    const output = document.getElementById("output");

    const result = rows.find(r => clean(r.c[0]?.v) === input);

    if (!result) {
        output.innerHTML = `<div class="card">❌ Job not found</div>`;
        return;
    }

    const c = result.c;

    const data = {
        jobId: clean(c[0]?.v),
        unitType: clean(c[2]?.v),
        unitModel: clean(c[3]?.v),
        issue: clean(c[4]?.v),
        resolution: clean(c[5]?.v),
        dateReceived: clean(c[6]?.v),
        status: normalizeStatus(clean(c[7]?.v)),
        asOf: clean(c[8]?.v),
        retrieved: clean(c[9]?.v)
    };

    output.innerHTML = `
        <div class="card">
            <h2>${data.jobId}</h2>

            <p><b>Device:</b> ${data.unitType} - ${data.unitModel}</p>
            <p><b>Issue:</b> ${data.issue}</p>
            <p><b>Resolution:</b> ${data.resolution}</p>

            <p><b>Status:</b> ${data.status}</p>

            <p><b>Date Received:</b> ${data.dateReceived}</p>
            <p><b>Last Update:</b> ${data.asOf}</p>
            <p><b>Retrieved:</b> ${data.retrieved}</p>
        </div>
    `;
}

loadData();
