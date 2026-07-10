const list = document.getElementById("engine-list");
const nameInput = document.getElementById("name");
const urlInput = document.getElementById("url");
const addForm = document.getElementById("add-form");
const exportBtn = document.getElementById("export");
const importInput = document.getElementById("import");
const cancelBtn = document.getElementById("cancel");
const sortBtn = document.getElementById("sort-name");
const sortIcon = document.getElementById("sort-icon");

let engines = [];
let editMode = false;
let editId = null;
let sortOrder = null; // null | 'asc' | 'desc'

function resetForm() {
    nameInput.value = "";
    urlInput.value = "";
    editMode = false;
    editId = null;
    addForm.querySelector("button[type=submit]").innerHTML = `<i class="fa fa-plus"></i> Add`;
    addForm.querySelector("button[type=submit]").classList.remove("btn-warning");
    addForm.querySelector("button[type=submit]").classList.add("btn-success");
    cancelBtn.classList.add("d-none");
}

cancelBtn.onclick = resetForm;

// Drag & Drop
let draggedIndex = null;

sortBtn.onclick = () => {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    engines.sort((a, b) => sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    chrome.storage.sync.set({ searchEngines: engines }, renderList);
};

function renderList() {
    list.innerHTML = "";

    sortIcon.className = sortOrder === 'asc'
        ? 'fa fa-sort-alpha-down'
        : sortOrder === 'desc'
            ? 'fa fa-sort-alpha-up'
            : 'fa fa-sort';

    engines.forEach((engine, index) => {
        const tr = document.createElement("tr");
        tr.setAttribute("draggable", "true");
        tr.dataset.index = index;

        // Drag events
        tr.ondragstart = () => draggedIndex = index;
        tr.ondragover = (e) => e.preventDefault();
        tr.ondrop = () => {
            if (draggedIndex === null || draggedIndex === index) return;
            const draggedItem = engines[draggedIndex];
            engines.splice(draggedIndex, 1);
            engines.splice(index, 0, draggedItem);
            sortOrder = null;
            chrome.storage.sync.set({ searchEngines: engines }, renderList);
        };

        const handleTd = document.createElement("td");
        handleTd.innerHTML = `<i class="fa fa-grip-vertical text-secondary" style="cursor: grab;"></i>`;
        tr.appendChild(handleTd);

        const nameTd = document.createElement("td");
        nameTd.textContent = engine.name;
        tr.appendChild(nameTd);

        const urlTd = document.createElement("td");
        urlTd.textContent = engine.url;
        tr.appendChild(urlTd);

        const actionTd = document.createElement("td");
        actionTd.className = "text-end";

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-primary me-1";
        editBtn.innerHTML = `<i class="fa fa-edit"></i>`;
        editBtn.onclick = () => {
            nameInput.value = engine.name;
            urlInput.value = engine.url + "{{query}}";
            editMode = true;
            editId = engine.id;
            addForm.querySelector("button[type=submit]").innerHTML = `<i class="fa fa-check"></i> Update`;
            addForm.querySelector("button[type=submit]").classList.remove("btn-success");
            addForm.querySelector("button[type=submit]").classList.add("btn-warning");
            cancelBtn.classList.remove("d-none");
        };
        actionTd.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.innerHTML = `<i class="fa fa-trash"></i>`;
        delBtn.onclick = () => {
            if (confirm(`Are you sure you want to delete "${engine.name}"?`)) {
                engines = engines.filter(e => e.id !== engine.id);
                chrome.storage.sync.set({ searchEngines: engines }, renderList);
            }
        };
        actionTd.appendChild(delBtn);

        tr.appendChild(actionTd);
        list.appendChild(tr);
    });
}

function loadEngines() {
    chrome.storage.sync.get("searchEngines", (data) => {
        engines = data.searchEngines || [];
        renderList();
    });
}

addForm.onsubmit = (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url.includes("{{query}}")) {
        alert("Please enter a name and a URL that includes {{query}}.");
        return;
    }

    const cleanUrl = url.replace("{{query}}", "");

    if (editMode && editId) {
        const engine = engines.find(e => e.id === editId);
        if (engine) {
            engine.name = name;
            engine.url = cleanUrl;
        }
        resetForm();
    } else {
        engines.push({
            id: crypto.randomUUID(),
            name,
            url: cleanUrl
        });
    }

    chrome.storage.sync.set({ searchEngines: engines }, () => {
        nameInput.value = "";
        urlInput.value = "";
        renderList();
    });
};

exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(engines, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snipsearch_engines.json";
    a.click();
    URL.revokeObjectURL(url);
};

importInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
        const imported = JSON.parse(event.target.result);

        // Validar formato básico
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        const valid = imported.every(e =>
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            typeof e.url === "string"
        );

        if (!valid) throw new Error("Invalid structure");

        chrome.storage.sync.set({ searchEngines: imported }, () => {
            loadEngines(); // Carga desde storage, asegura sincronización
        });
        } catch (err) {
        alert("Import failed: invalid file format or data.");
        }
    };
    reader.readAsText(file);
};

loadEngines();
