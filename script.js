const SHEET_ID = "1ESU-NGsVNWwJ7Ui3REO5FFROdxQ8KkIDQhFYuQXvc-g";
const SHEET_GID = "0";

const URL = "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?tqx=out:json&gid=" +
    SHEET_GID;

let rows = [];

function clean(cell) {
    if (!cell) return "-";

    // Use formatted value first
    if (cell.f !== undefined && cell.f !== null) {
        return cell.f;
    }

    // Fall back to raw value
    if (cell.v !== undefined && cell.v !== null) {
        return cell.v;
    }

    return "-";
}

async function loadData() {
    try {
        const res = await fetch(URL);
        const text = await res.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));

        rows = json.table.rows || [];

        console.log("Loaded", rows.length, "rows");
    } catch (err) {
        console.error("Failed to load sheet:", err);
    }
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
    const input = document.getElementById("jobInput").value.trim().toUpperCase();
    const output = document.getElementById("output");

    const result = rows.find(r =>
        clean(r.c[0]).toUpperCase() === input
    );

    if (!result) {
        output.innerHTML = `
            <div class="card">
                <h2>❌ Job Not Found</h2>
                <p>Please check your Job ID.</p>
            </div>
        `;
        return;
    }

    const c = result.c;

    const data = {
        jobId: clean(c[0]),
        unitType: clean(c[2]),
        unitModel: clean(c[3]),
        issue: clean(c[4]),
        resolution: clean(c[5]),
        dateReceived: clean(c[6]),
        status: normalizeStatus(clean(c[14])),
        asOf: clean(c[15]),
        retrieved: clean(c[16])
    };

    output.innerHTML = `
        <div class="card">
            <h2>${data.jobId}</h2>

            <p><strong>📱 Device:</strong><br>${data.unitType} - ${data.unitModel}</p>

            <p><strong>⚠️ Issue:</strong><br>${data.issue}</p>

            <p><strong>🔧 Resolution:</strong><br>${data.resolution}</p>

            <p><strong>📊 Status:</strong><br>${data.status}</p>

            <p><strong>📅 Date Received:</strong><br>${data.dateReceived}</p>

            <p><strong>🕒 Last Update:</strong><br>${data.asOf}</p>

            <p><strong>📦 Retrieved:</strong><br>${data.retrieved}</p>
        </div>
    `;
}

loadData();
