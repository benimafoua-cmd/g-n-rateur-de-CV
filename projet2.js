// --- Liaison en temps réel des champs simples ---
const bindInput = (inputId, viewId) => {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.addEventListener('input', (e) => {
            document.getElementById(viewId).innerText = e.target.value || ' ';
            saveData();
        });
    }
};

bindInput('input-name', 'cv-name');
bindInput('input-title', 'cv-job-title');
bindInput('input-email', 'cv-email');
bindInput('input-phone', 'cv-phone');

// --- Gestion de la Photo ---
document.getElementById('input-photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1500000) {
            alert("La photo est trop lourde (max 1.5 Mo).");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Image = event.target.result;
            displayPhoto(base64Image);
            try {
                localStorage.setItem('cv_photo', base64Image);
            } catch (error) {
                console.log("Espace localStorage saturé pour la photo.");
            }
        };
        reader.readAsDataURL(file);
    }
});

function displayPhoto(src) {
    const img = document.getElementById('cv-photo');
    img.src = src;
    img.style.display = 'block';
}

// --- Gestion Dynamique des Compétences ---
function addSkillInput(value = "") {
    const container = document.getElementById('skills-container');
    const id = Date.now() + Math.random();

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.id = `skill-item-${id}`;
    div.innerHTML = `
        <input type="text" placeholder="Ex: JavaScript" class="skill-input" value="${value}">
        <button type="button" class="btn-remove">Supprimer</button>
    `;
    
    div.querySelector('.skill-input').addEventListener('input', () => {
        updateSkills();
        saveData();
    });
    
    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
        updateSkills();
        saveData();
    });

    container.appendChild(div);
    updateSkills();
}

function updateSkills() {
    const inputs = document.querySelectorAll('#skills-container .skill-input');
    const cvSkillsList = document.getElementById('cv-skills');
    cvSkillsList.innerHTML = '';

    inputs.forEach(input => {
        if(input.value.trim() !== "") {
            const li = document.createElement('li');
            li.innerText = input.value;
            cvSkillsList.appendChild(li);
        }
    });
}

// --- Gestion Dynamique des Expériences ---
function addExperienceInput(data = {title: "", date: "", desc: ""}) {
    const container = document.getElementById('experience-container');
    const id = Date.now() + Math.random();

    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.id = `exp-item-${id}`;
    div.innerHTML = `
        <div class="form-group"><label>Entreprise & Poste</label><input type="text" class="exp-title" placeholder="Ex: Tech Corp" value="${data.title || ''}"></div>
        <div class="form-group"><label>Dates</label><input type="text" class="exp-date" placeholder="Ex: 2024" value="${data.date || ''}"></div>
        <div class="form-group"><label>Description</label><textarea class="exp-desc" rows="2">${data.desc || ''}</textarea></div>
        <button type="button" class="btn-remove">Supprimer</button>
    `;

    div.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            updateExperiences();
            saveData();
        });
    });

    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
        updateExperiences();
        saveData();
    });

    container.appendChild(div);
    updateExperiences();
}

function updateExperiences() {
    const items = document.querySelectorAll('#experience-container .dynamic-item');
    const cvExpContainer = document.getElementById('cv-experiences');
    cvExpContainer.innerHTML = '';

    items.forEach(item => {
        const title = item.querySelector('.exp-title').value;
        const date = item.querySelector('.exp-date').value;
        const desc = item.querySelector('.exp-desc').value;

        if(title.trim() !== "" || date.trim() !== "" || desc.trim() !== "") {
            const expDiv = document.createElement('div');
            expDiv.className = 'cv-experience-item';
            expDiv.innerHTML = `
                <h4>${title}</h4>
                <div class="duration">${date}</div>
                <p>${desc.replace(/\n/g, '<br>')}</p>
            `;
            cvExpContainer.appendChild(expDiv);
        }
    });
}

// --- LOGIQUE LOCALSTORAGE ---
function saveData() {
    const profileData = {
        name: document.getElementById('input-name').value,
        title: document.getElementById('input-title').value,
        email: document.getElementById('input-email').value,
        phone: document.getElementById('input-phone').value,
    };
    localStorage.setItem('cv_profile', JSON.stringify(profileData));

    const skills = [];
    document.querySelectorAll('#skills-container .skill-input').forEach(input => {
        skills.push(input.value);
    });
    localStorage.setItem('cv_skills', JSON.stringify(skills));

    const experiences = [];
    document.querySelectorAll('#experience-container .dynamic-item').forEach(item => {
        experiences.push({
            title: item.querySelector('.exp-title').value,
            date: item.querySelector('.exp-date').value,
            desc: item.querySelector('.exp-desc').value
        });
    });
    localStorage.setItem('cv_experiences', JSON.stringify(experiences));
}

function loadData() {
    const savedProfile = localStorage.getItem('cv_profile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('input-name').value = profile.name || '';
        document.getElementById('input-title').value = profile.title || '';
        document.getElementById('input-email').value = profile.email || '';
        document.getElementById('input-phone').value = profile.phone || '';
        
        document.getElementById('cv-name').innerText = profile.name || 'NOM PRENOM';
        document.getElementById('cv-job-title').innerText = profile.title || 'METIER';
        document.getElementById('cv-email').innerText = profile.email || 'exemple@gmail.com';
        document.getElementById('cv-phone').innerText = profile.phone || '06 00 00 00 00';
    }

    const savedPhoto = localStorage.getItem('cv_photo');
    if (savedPhoto) displayPhoto(savedPhoto);

    const savedSkills = localStorage.getItem('cv_skills');
    if (savedSkills) {
        const skills = JSON.parse(savedSkills);
        if (skills.length > 0) { skills.forEach(skill => addSkillInput(skill)); } 
        else { addSkillInput(); }
    } else { addSkillInput(); }

    const savedExperiences = localStorage.getItem('cv_experiences');
    if (savedExperiences) {
        const experiences = JSON.parse(savedExperiences);
        if (experiences.length > 0) { experiences.forEach(exp => addExperienceInput(exp)); } 
        else { addExperienceInput(); }
    } else { addExperienceInput(); }
}

// --- TELECHARGEMENT PDF NETTOYÉ (PROBLÈME RÉSOLU ICI) ---
function generatePDF() {
    // On cible UNIQUEMENT la boîte du CV, pas le formulaire
    const element = document.getElementById('cv-template');
    
    // Étape 1 : Retrait temporaire du zoom écran pour avoir une taille A4 géométrique exacte
    element.style.transform = "none";
    element.style.boxShadow = "none";

    const opt = {
        margin:       0,
        filename:     'Mon_CV.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
            scale: 2,           // Force la haute résolution
            useCORS: true,      // Autorise l'image de profil
            logging: false,
            letterRendering: true
        }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Étape 2 : Génération stricte du fichier
    html2pdf()
        .set(opt)
        .from(element) // Capture seulement le CV
        .save()
        .then(() => {
            // Étape 3 : Remise en place de l'aperçu zoomé pour l'écran de l'utilisateur
            element.style.transform = "scale(0.75)";
            element.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
        })
        .catch((err) => {
            console.error(err);
            element.style.transform = "scale(0.75)";
        });
}

document.getElementById('btn-add-skill').addEventListener('click', () => addSkillInput(""));
document.getElementById('btn-add-experience').addEventListener('click', () => addExperienceInput());
document.getElementById('btn-download-pdf').addEventListener('click', generatePDF);

window.addEventListener('DOMContentLoaded', loadData);