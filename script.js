
const SHEET_ID = "1ESU-NGsVNWwJ7Ui3REO5FFROdxQ8KkIDQhFYuQXvc-g";
const SHEET_GID = "0";

const URL =
    "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?tqx=out:json&gid=" +
    SHEET_GID;

let rows = [];

function clean(cell) {
    if (!cell) return "-";

    // Prefer the formatted value, then fall back to the raw value.
    if (cell.f !== undefined && cell.f !== null) {
        return String(cell.f);
    }

    if (cell.v !== undefined && cell.v !== null) {
        return String(cell.v);
    }

    return "-";
}

async function loadData() {
    try {
        const res = await fetch(URL);

        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }

        const text = await res.text();
        const jsonText = text.substring(47).slice(0, -2);
        const json = JSON.parse(jsonText);

        rows = json.table.rows || [];

        console.log("Loaded", rows.length, "rows");
    } catch (err) {
        console.error("Failed to load sheet:", err);

        const output = document.getElementById("output");

        if (output) {
            output.innerHTML = `
                <div class="card">
                    <h2>⚠️ Unable to Load Data</h2>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }
}

function normalizeStatus(status) {
    const s = String(status).toLowerCase();

    if (s.includes("fixed")) {
        return "🟢 Fixed (Can be now Retrieved)";
    }

    if (s.includes("in progress")) {
        return "🟡 In Progress (Check status again later)";
    }

    if (s.includes("pending")) {
        return "🟠 Pending (Please check your inquiry for necessary process)";
    }

    if (s.includes("returned")) {
        return "🔵 Returned (Repair is not set)";
    }

    if (s.includes("failed")) {
        return "🔴 Failed (Repair failed)";
    }

    if (s.includes("incapable")) {
        return "⚫ Incapable (Repair cannot be completed due to tool or skill limitations)";
    }

    if (s.includes("cancel")) {
        return "⚪ Cancelled (Repair is aborted)";
    }

    return status;
}

function normalizePaymentStatus(paymentStatus) {
    const s = String(paymentStatus).toLowerCase();
    
    if (s.includes("unpaid")) {
        return "🔴 Unpaid";
    }

    if (s.includes("partial")) {
        return "🟡 Partially Paid";
    }

    if (s.includes("paid")) {
        return "🟢 Paid";
    }

    return paymentStatus;
}

function searchJob() {
    const input = document
        .getElementById("jobInput")
        .value
        .trim()
        .toUpperCase();

    const output = document.getElementById("output");

    const result = rows.find(r =>
        clean(r.c?.[0]).toUpperCase() === input
    );

    if (!result) {
        output.innerHTML = `
            <div class="card">
                <h2>❌ Job ID Not Found</h2>
                <p>Please check your Job ID or ask the operator for assistance.</p>
            </div>
        `;
        return;
    }

    const c = result.c || [];

    const data = {
        jobId: clean(c[0]),
        unitType: clean(c[2]),
        unitModel: clean(c[3]),
        issue: clean(c[4]),
        resolution: clean(c[5]),
        dateReceived: clean(c[6]),
        
        paymentStatus: normalizePaymentStatus(clean(c[14])),

        status: normalizeStatus(clean(c[15])),
        asOf: clean(c[16]),
        retrieved: clean(c[17])
    };

    output.innerHTML = `
        <div class="card">
            <h2>${data.jobId}</h2>

            <p>
                <strong>DEVICE:</strong><br>
                ${data.unitType} - ${data.unitModel}
            </p>

            <p>
                <strong>ISSUE:</strong><br>
                ${data.issue}
            </p>

            <p>
                <strong>RESOLUTION:</strong><br>
                ${data.resolution}
            </p>

            <p>
                <strong>STATUS:</strong><br>
                ${data.status}
            </p>

            <p>
                <strong>PAYMENT STATUS:</strong><br>
                ${data.paymentStatus}
            </p>

            <p>
                <strong>DATE RECEIVED:</strong><br>
                ${data.dateReceived}
            </p>

            <p>
                <strong>LAST UPDATED:</strong><br>
                ${data.asOf}
            </p>

            <p>
                <strong>RETRIEVED ON:</strong><br>
                ${data.retrieved}
            </p>
        </div>
    `;
}

loadData();
