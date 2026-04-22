
// Photo gallery management: store images in localStorage, max 4 images preview
const galleryContainer = document.getElementById('photoGallery');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const photoUploadInput = document.getElementById('photoUploadInput');
const toastEl = document.getElementById('toastMsg');
const toastTextSpan = document.getElementById('toastText');

let currentPhotos = []; // store base64 strings

// Load from localStorage
function loadPhotosFromStorage() {
    const stored = localStorage.getItem('aboutMePhotos');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                currentPhotos = parsed;
            }
        } catch(e) { console.warn(e); }
    }
    renderGallery();
}

// save to localStorage
function savePhotosToStorage() {
    try {
        localStorage.setItem('aboutMePhotos', JSON.stringify(currentPhotos));
    } catch(e) { console.warn("storage limit"); }
}

// show toast message
function showToast(message, isSuccess = true) {
    toastTextSpan.innerText = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// render the photo gallery
function renderGallery() {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    // show up to 4 photos maximum (better UX)
    const photosToShow = currentPhotos.slice(0, 4);
    if (photosToShow.length === 0) {
        // empty state: show placeholder icon
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'photo-item';
        emptyDiv.style.cursor = 'default';
        emptyDiv.innerHTML = `<div class="photo-placeholder-img">📷</div><div class="photo-overlay-badge">add yours</div>`;
        galleryContainer.appendChild(emptyDiv);
    } else {
        photosToShow.forEach((photoSrc, idx) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo-item';
            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = `Profile shot ${idx+1}`;
            const overlaySpan = document.createElement('div');
            overlaySpan.className = 'photo-overlay-badge';
            overlaySpan.innerText = 'click to replace';
            photoDiv.appendChild(img);
            photoDiv.appendChild(overlaySpan);
            // replace photo on click
            photoDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                replacePhotoAtIndex(idx);
            });
            galleryContainer.appendChild(photoDiv);
        });
    }
    // if less than 4 photos, we can also show an 'add more' indicator? But we have separate add button
    // show a small + indicator if less than 4 but we already have add button
    if (currentPhotos.length > 0 && currentPhotos.length < 4) {
        const addMoreDiv = document.createElement('div');
        addMoreDiv.className = 'photo-item';
        addMoreDiv.style.background = '#eef2ff';
        addMoreDiv.style.border = '2px dashed #3b82f6';
        addMoreDiv.style.cursor = 'pointer';
        addMoreDiv.innerHTML = `<div class="photo-placeholder-img" style="background:#eef2ff;">+</div><div class="photo-overlay-badge">add more</div>`;
        addMoreDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerPhotoUpload();
        });
        galleryContainer.appendChild(addMoreDiv);
    }
}

function triggerPhotoUpload() {
    photoUploadInput.click();
}

// replace photo at specific index
function replacePhotoAtIndex(index) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg, image/png, image/jpg, image/webp';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                if (currentPhotos[index]) {
                    currentPhotos[index] = ev.target.result;
                    savePhotosToStorage();
                    renderGallery();
                    showToast(`Photo ${index+1} updated! ✓`, true);
                }
            };
            reader.readAsDataURL(file);
        } else {
            showToast("Please select a valid image", false);
        }
    };
    fileInput.click();
}

// add new photo (max 4)
function addNewPhoto(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast("Please select a valid image (JPEG, PNG)", false);
        return false;
    }
    if (currentPhotos.length >= 4) {
        showToast("Maximum 4 photos allowed. Click on a photo to replace it.", false);
        return false;
    }
    const reader = new FileReader();
    reader.onload = function(ev) {
        currentPhotos.push(ev.target.result);
        savePhotosToStorage();
        renderGallery();
        showToast(`New photo added! (${currentPhotos.length}/4)`, true);
    };
    reader.readAsDataURL(file);
    return true;
}

// handle multiple file selection (but we treat one by one)
photoUploadInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    // add first selected file (simplicity)
    const firstFile = files[0];
    addNewPhoto(firstFile);
    photoUploadInput.value = ''; // reset
});

addPhotoBtn.addEventListener('click', () => {
    if (currentPhotos.length >= 4) {
        showToast("You already have 4 photos. Click on any photo to replace it.", false);
        return;
    }
    triggerPhotoUpload();
});

// demo resume builder click simulation
const tryBtn = document.getElementById('tryBuilderBtn');
if (tryBtn) {
    tryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast("🚀 Resume builder is coming soon! 100% free, no paywall. Stay tuned.", true);
    });
}

// initial load
loadPhotosFromStorage();

// Prepopulate with some default / example photos? we could leave empty but provide sample placeholder hint
// but we add a nice welcome default if no photos: keep empty gallery but show add hint
// Also set example default stats: 
// Additional: maybe add a default demo photo for better visual? optional but not required
if (currentPhotos.length === 0) {
    // Optionally pre-load a placeholder? But better to let user add. We'll not force.
    // just render empty state
    renderGallery();
}

// Optional: small easter egg for New Mexico pride
console.log("🇺🇸 Built in New Mexico · free forever resume tool");

