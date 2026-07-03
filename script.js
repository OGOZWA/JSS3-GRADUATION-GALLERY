import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ======================
// SUPABASE
// ======================

const supabaseUrl = "https://ksiehzlsdsedymbhtscq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaWVoemxzZHNlZHltYmh0c2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MDgzOTAsImV4cCI6MjA5ODQ4NDM5MH0.BGEP4zH9tH8jf1wixLxc6TtURj2FYOkLnPdT8dC8h_8";

const supabase = createClient(supabaseUrl, supabaseKey);

// ======================
// ELEMENTS
// ======================

const gallery = document.getElementById("gallery");
const uploadBtn = document.getElementById("uploadbtn");
const fileInput = document.getElementById("fileInput");
const studentBtn = document.getElementById("studentAccess");

// ======================
// ADMIN MODE
// ======================

let isAdmin = false;

// Hide upload button until login
uploadBtn.style.display = "none";

// ======================
// STUDENT ACCESS
// ======================

studentBtn.addEventListener("click", () => {

    const password = prompt("Enter Student Password");

    if (password === "graduation gallery") {

        isAdmin = true;

        uploadBtn.style.display = "inline-block";

        studentBtn.style.display = "none";

        alert("Student Access Granted!");

        loadGallery();

    } else {

        alert("Wrong Password!");

    }

});

// ======================
// LOAD GALLERY
// ======================

async function loadGallery() {

    gallery.innerHTML = "";

    const { data, error } = await supabase.storage
        .from("gallery")
        .list("", {
            sortBy: {
                column: "name",
                order: "desc"
            }
        });

    if (error) {

        console.error(error);

        return;

    }

    for (const file of data) {

        const { data: publicData } =
            supabase.storage
                .from("gallery")
                .getPublicUrl(file.name);

        createCard(publicData.publicUrl, file.name);

    }

}

// ======================
// CREATE PHOTO CARD
// ======================

function createCard(imageURL, fileName) {

    const card = document.createElement("div");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = imageURL;

    card.appendChild(img);

    // Download button

    const downloadBtn = document.createElement("button");

    downloadBtn.className = "download-btn";

    downloadBtn.innerHTML = "⬇";

    downloadBtn.onclick = async () => {

        const response = await fetch(imageURL);

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = fileName;

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);

    };

    card.appendChild(downloadBtn);

        // ======================
    // DELETE BUTTON (Students Only)
    // ======================

    if (isAdmin) {

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "delete-btn";

        deleteBtn.innerHTML = "✖";

        deleteBtn.onclick = async () => {

            const confirmDelete = confirm("Delete this image?");

            if (!confirmDelete) return;

            const { error } = await supabase.storage
                .from("gallery")
                .remove([fileName]);

            if (error) {

                console.error(error);

                alert("Delete failed!");

                return;

            }

            loadGallery();

        };

        card.appendChild(deleteBtn);

    }

    gallery.appendChild(card);

}

// ======================
// UPLOAD IMAGE
// ======================

uploadBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", async () => {

    const files = fileInput.files;

    if (!files.length) return;

    for (const file of files) {

        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("gallery")
            .upload(fileName, file);

        if (error) {

            console.error(error);

            alert("Upload failed!");

            continue;

        }

    }

    fileInput.value = "";

    loadGallery();

});

// ======================
// START APP
// ======================
loadGallery();
