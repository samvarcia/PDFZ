let db;

// Open a database and create an object store to save the PDF files
const openDB = () => {
  const request = indexedDB.open("pdfDatabase", 1);
  request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore("pdfs", {
      keyPath: "id",
      autoIncrement: true,
    });
    objectStore.createIndex("name", "name", { unique: false });
  };
  request.onsuccess = (event) => {
    db = event.target.result;
    displayPdfs();
  };
  request.onerror = (event) => {
    console.log("Error opening database", event.target.error);
  };
};
openDB();

// Save a PDF file to the object store
const savePdf = (file) => {
  const transaction = db.transaction(["pdfs"], "readwrite");
  const objectStore = transaction.objectStore("pdfs");
  objectStore.add({ name: file.name, file });
};

// Display the list of saved PDF files
const displayPdfs = () => {
  const pdfList = document.getElementById("pdf-list");
  while (pdfList.firstChild) {
    pdfList.removeChild(pdfList.firstChild);
  }
  const transaction = db.transaction(["pdfs"], "readonly");
  const objectStore = transaction.objectStore("pdfs");
  const request = objectStore.getAll();
  request.onsuccess = (event) => {
    const pdfs = event.target.result;
    pdfs.forEach((pdf) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pdf.file);
      a.download = pdf.name;
      a.innerHTML = pdf.name;
      li.appendChild(a);
      // Create a preview of the PDF
      const iframe = document.createElement("iframe");
      iframe.src = URL.createObjectURL(pdf.file);
      iframe.style.width = "800px";
      iframe.style.height = "800px";
      li.appendChild(iframe);
      pdfList.appendChild(li);
    });
  };
  request.onerror = (event) => {
    console.log("Error getting PDFs from object store", event.target.error);
  };
};
// Listen for changes to the file input
const pdfInput = document.getElementById("pdf-input");

console.log(pdfInput);
pdfInput.addEventListener("change", (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    savePdf(files[i]);
  }
  event.target.value = null;
  displayPdfs();
});
