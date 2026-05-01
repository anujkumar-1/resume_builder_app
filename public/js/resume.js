let API_URL = window.API_CONFIG?.development || "http://localhost:3000"
const singleColumnLayout = ["summary", "experience", "skills", "education", "certification", "awards", "languages"]
// Section HTML templates
const sectionTemplates = {
    experience: `
        <div class="resume-section" id="experienceSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="experienceSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="experienceSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Experience</h2>
                <div class="section-actions">
                    <button class="section-action-btn add-btn" data-section="experience">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
            <div class="section-content">
                
                
            </div>
        </div>
    `,
    summary: `
        <div class="resume-section" id="summarySection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="summarySection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="summarySection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Summary</h2>
                <div class="section-actions">
                    <button class="section-action-btn edit-btn" data-section="summary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
            <div class="section-content">
                <p id="summaryContent">Experienced web developer with 5+ years of experience in building responsive and user-friendly websites. Proficient in HTML, CSS, JavaScript, and modern frameworks like React. Strong problem-solving skills and a passion for creating efficient and visually appealing web applications.</p>
            </div>
        </div>
    `,
    
    certificates: `
        <div class="resume-section" id="certificatesSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="certificateSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="certificateSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Certificates</h2>
                <div class="section-actions">
                    <button class="section-action-btn edit-btn" data-section="certificates">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
            <div class="section-content">
                <ul id="certificatesList">
                    <li>Certified Web Developer - W3Schools (2020)</li>
                    <li>AWS Certified Developer - Associate (2019)</li>
                    <li>Google Analytics Individual Qualification (2018)</li>
                </ul>
            </div>
        </div>
    `,
    awards: `
        <div class="resume-section" id="awardsSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="awardsSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="awardsSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Awards</h2>
                <div class="section-actions">
                    <button class="section-action-btn edit-btn" data-section="awards">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
            <div class="section-content">
                <ul id="awardsList">
                    <li>Employee of the Month - Tech Solutions Inc. (June 2021)</li>
                    <li>Best Web Design - State University Hackathon (2016)</li>
                    <li>Outstanding Academic Achievement - State University (2015)</li>
                </ul>
            </div>
        </div>
    `,
    languages: `
        <div class="resume-section" id="languagesSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="languageSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="languageSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Languages</h2>
                <div class="section-actions">
                    <button class="section-action-btn edit-btn" data-section="languages">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
            <div class="section-content">
                <div class="skills-list" id="languagesList">
                    <span class="skill-tag">English (Fluent)</span>
                    <span class="skill-tag">Spanish (Intermediate)</span>
                    <span class="skill-tag">French (Basic)</span>
                </div>
            </div>
        </div>
    `,

    intrests: `
        <div class="resume-section" id="intrestsSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="intrestSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="intrestSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Intrests</h2>
                <div class="section-actions">
                    <button class="section-action-btn edit-btn" data-section="intrests">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
            <div class="section-content">
                <div class="intrest-list" id="intrestList">
                    <span class="intrest-tag">Swimming</span>
                    <span class="intrest-tag">Running</span>
                    <span class="intrest-tag">Travelling</span>
                </div>
            </div>
        </div>
    `,
    projects: `
    
         <!-- Project Section -->
        <div class="resume-section" id="projectSection">
            <div class="move-buttons">
                <button class="move-btn move-up-btn" data-section="projectSection">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn move-down-btn" data-section="projectSection">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Projects</h2>
                <div class="section-actions">
                    <button class="section-action-btn add-btn" data-section="project">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
            <div class="section-content">
                    
            </div>
        </div>
    
    `
};


function showToast(message) {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            container.removeChild(toast);
        }, 500);
    }, 3000); 
}


// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const closeMobileMenu = document.querySelector('.close-mobile-menu');
const mobileNav = document.querySelector('.mobile-nav');
const overlay = document.querySelector('.resume-overlay');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
const editExperiencemodal = document.getElementById('editExperienceModal');
const editEducationModal = document.getElementById('editEducationModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelEdit');

let currentlyEditingExperience = null;

// text editor

const editor = document.getElementById('editor');
const toolbarButtons = document.querySelectorAll('.toolbar button[data-command]');
const insertLinkBtn = document.getElementById('insertLink');
const linkDialog = document.getElementById('linkDialog');
const overlayTextEditor = document.getElementById('overlay-text-editor');
const linkUrlInput = document.getElementById('linkUrl');
const insertLinkBtnDialog = document.getElementById('insertLinkBtn');
const cancelLinkBtn = document.getElementById('cancelLinkBtn');


// Resume builder


// DOM Elements
const manageSectionsBtn = document.getElementById('manageSectionsBtn');
const manageSectionsSidebar = document.getElementById('manageSectionsSidebar');
const templatesBtn = document.getElementById('templatesBtn');
const downloadBtn = document.getElementById('downloadBtn');
const applySectionsBtn = document.getElementById('applySectionsBtn');
const resumePreview = document.getElementById('resumePreview');

// navbar element   
const hamburger = document.getElementById('hamburgerBtn');
const mobileOverlay = document.getElementById('mobileOverlay');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');

const resumeItem = document.querySelector('.mobile-nav-item[data-accordion="resume"]');
const resumeTrigger = document.getElementById('resumeTrigger');
const allMobileLinks = document.querySelectorAll('.mobile-nav-link, .submenu-list a, .mobile-extra-links a, .mobile-post-btn, .mobile-signin');

      
// Modal elements
const contactModal = document.getElementById('contactModal');
const experienceModal = document.getElementById('experienceModal');
const skillsModal = document.getElementById('skillsModal');
const educationModal = document.getElementById('educationModal');
const summaryModal = document.getElementById('summaryModal');
const languagesModal = document.getElementById('languagesModal');
const certificatesModal = document.getElementById('certificatesModal');
const awardsModal = document.getElementById('awardsModal');
const intrestModal = document.getElementById("intrestModal");
const projectModal = document.getElementById("projectModal");
const templatesModal = document.getElementById('templatesModal');

// Section toggles
const summaryToggle = document.getElementById('summaryToggle');
const experienceToggle = document.getElementById('experienceToggle');
const skillsToggle = document.getElementById('skillsToggle');
const educationToggle = document.getElementById('educationToggle');
const languagesToggle = document.getElementById('languagesToggle');
const certificatesToggle = document.getElementById('certificatesToggle');
const awardsToggle = document.getElementById('awardsToggle');
const intrestToggle = document.getElementById('intrestToggle');
const projectToggle = document.getElementById('projectToggle');



// template theme
let arr = ["#2C3E50", "#1A1A2E", "#0F172A", "#6B21A5", "#1E3A8A", "#000000"]
const colorTheme = ["professional", "elegant", "modern", "creative", "corporate", "minimal"]
const colorGradient = document.getElementById("color-gradient")
const allTemplatesTheme = document.getElementById("all-templates-themes")


const moveUpButton = document.querySelectorAll(".move-up-btn");

let allExperienceArr =[]
console.log(moveUpButton)
moveUpButton.forEach(btn=>{
    btn.addEventListener("click", (e)=>{
        const section = btn.getAttribute('data-section');
        console.log(section)
    })
})

window.addEventListener("DOMContentLoaded", async (e) => {
    const token = localStorage.getItem("token");
    const user= await axios.get(`${API_URL}/resume/getResumeInfo`, {headers: {Authorization: token}})
    console.log(user)
    updateContactInfoResume(user)
    if(user.data.resumeInfo[0].summary){
        updateSummaryInfoResume(user.data.resumeInfo[0].summary)
    }
    if(user.data.resumeInfo[0].experience){
        updateExperienceInfoResume(user.data.resumeInfo[0].experience)
    }
    if(user.data.resumeInfo[0].skills){
        updateSkillInfoResume(user.data.resumeInfo[0].skills)
    }
    if(user.data.resumeInfo[0].education.length > 0){
        console.log(user.data.resumeInfo[0].education)
        updateEducationInfoResume( user.data.resumeInfo[0].education)

    }

    if(user.data.resumeInfo[0].certificates){
        updateCertificatesInfoResume(user.data.resumeInfo[0].certificates)
    }
    if(user.data.resumeInfo[0].awards){
        updateAwardsInfoResume(user.data.resumeInfo[0].awards)
    }
    if(user.data.resumeInfo[0].languages){
        updateLangauageInfoResume(user.data.resumeInfo[0].languages)
    }
    if(user.data.resumeInfo[0].intrests){
        updateIntrestInfoResume(user.data.resumeInfo[0].intrests)
    }
    if(user.data.resumeInfo[0].projects){
        updateProjectInfoResume(user.data.resumeInfo[0].projects)

    }
    // updateResumeDetails(user)
})

function updateExperienceInfoResume(response){
    if( response.length!=0){
        document.getElementById("experienceDemo").style.display="none"
        const skillsSection = document.getElementById('skillsSection');
        skillsSection.insertAdjacentHTML('afterend', sectionTemplates.experience);

        response.forEach(res=>{
            let result = res.startDate + " - " + res.endDate;

                // projectTitle, projectDescription, projectDuration, projectEditor, uid
            const project = createExperienceItem(res.role, res.company, result, res.description, res._id);
            document.querySelector('#experienceSection .section-content').appendChild(project);
        })
    }
    
}

function updateEducationInfoResume(response){
    if(response.length != 0){
        // In a real app, you would update the specific education item being edited
        response.forEach(res=>{
            const education = createEducationItem(res.degree, res.institution, res.year, res._id);
            document.querySelector('#educationSection .section-content').appendChild(education);
        })
    }
}
function updateContactInfoResume(response){
    document.getElementById('contactName').textContent = response.data.userInfo[0].username;
    document.getElementById('contactPhone').textContent = response.data.userInfo[0].mobile;
    document.getElementById('contactEmail').textContent = response.data.userInfo[0].email;

    let obj = {
        name: response.data.userInfo[0].username,
        mobile: response.data.userInfo[0].mobile,
        email: response.data.userInfo[0].email,
    }

    localStorage.setItem("updateContactInfoResume",JSON.stringify(obj));
}


function updateSkillInfoResume(response){
    // skills section

    if(response!=null){
        const skillsList = document.querySelector('.skills-list');
        skillsList.innerHTML = '';
        response.forEach(skill => {
                if (skill) {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'skill-tag';
                    skillTag.textContent = skill;
                    skillsList.appendChild(skillTag);
                }
        });

        let obj = {
            skills: response
        }

        localStorage.setItem("skillInfo", JSON.stringify(obj));
    }
    
}


function updateSummaryInfoResume(response){
    if( response){
        const contactSection = document.getElementById('contactInfoSection');
        contactSection.insertAdjacentHTML('afterend', sectionTemplates.summary);
        document.getElementById('summaryContent').textContent = response;

        let obj ={
            summary: response
        }
        localStorage.setItem("summaryInfo", JSON.stringify(obj))
    }
    else{
    }

}


function updateCertificatesInfoResume(response){
    console.log(response)
    if(response.length!=0){
        let obj ={
            certificate: response
        }
        localStorage.setItem("certificateInfo", JSON.stringify(obj))
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.certificates);
        const certificatesList = document.getElementById('certificatesList');
        certificatesList.innerHTML = '';

        response.forEach(cert => {
            if (cert) {
                const li = document.createElement('li');
                li.textContent = cert;
                certificatesList.appendChild(li);
            }
        });
    }
}


function updateLangauageInfoResume(response){
    if( response.length!=0){
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.languages);
        const languagesList = document.getElementById('languagesList');
        languagesList.innerHTML = '';
            
            
        response.forEach(lang => {
            if (lang) {
                const langTag = document.createElement('span');
                langTag.className = 'skill-tag';
                langTag.textContent = lang;
                languagesList.appendChild(langTag);
            }
        });

        let obj={
            languages: response
        }
        localStorage.setItem("langInfo", JSON.stringify(obj));
    }
}


function updateAwardsInfoResume(response){
    console.log(response);
    if( response.length!=0){
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.awards);
        const awardsList = document.getElementById('awardsList');
        awardsList.innerHTML = '';

        response.forEach(award => {
            if (award) {
                const li = document.createElement('li');
                li.textContent = award;
                awardsList.appendChild(li);
            }
        });

        let obj={
            awards: response
        }
        localStorage.setItem("awardsInfo", JSON.stringify(obj));

    }
}

function updateIntrestInfoResume(response){

    if(response.length!=0){
        const intrests = response.split(',').map(intrest => intrest.trim());
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.intrests);

        
        const intrestList = document.getElementById('intrestList');
        intrestList.innerHTML = '';


        intrests.forEach(int => {
                if (int) {
                    const intrestTag = document.createElement('span');
                    intrestTag.className = 'intrest-tag';
                    intrestTag.textContent = int;
                    intrestList.appendChild(intrestTag);
                }
        });
    }
    
}


function updateProjectInfoResume(response){
    if( response.length!=0){
        const educationSection = document.getElementById('educationSection');
        educationSection.insertAdjacentHTML('afterend', sectionTemplates.projects);

        response.forEach(res=>{
        let result = res.startDate + " - " + res.endDate;

            // projectTitle, projectDescription, projectDuration, projectEditor, uid
        const project = createProjectItem(res.title, res.description, result, res.summary, res._id);
        document.querySelector('#projectSection .section-content').appendChild(project);
    })
    }
}
// navbar menu dropdown mobile

function openDrawer() {
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
      
function closeDrawer() {
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for open/close
if (hamburger) {
    hamburger.addEventListener('click', openDrawer);
}
if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
}

// Close when clicking on overlay background
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', (e) => {
        if (e.target === mobileOverlay) {
        closeDrawer();
        }
    });
}

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
        closeDrawer();
    }
});


let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 900 && mobileOverlay.classList.contains('active')) {
        closeDrawer();
        }
    }, 150);
});
      

if (resumeItem && resumeTrigger) {
    const subContainer = resumeItem.querySelector('.submenu-container');
    const chevron = resumeTrigger.querySelector('.chevron-icon');
    
    resumeItem.classList.remove('open');
    if (subContainer) subContainer.style.maxHeight = null;
    
    function toggleResumeAccordion(e) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = resumeItem.classList.contains('open');
        
        if (isOpen) {
            resumeItem.classList.remove('open');
            if (subContainer) subContainer.style.maxHeight = null;
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
            resumeItem.classList.add('open');
            if (subContainer) {
            subContainer.style.maxHeight = subContainer.scrollHeight + 'px';
            }
            if (chevron) chevron.style.transform = 'rotate(90deg)';
        }
    }
    resumeTrigger.addEventListener('click', toggleResumeAccordion);
}
    
     

window.addEventListener('load', function() {
    const activeAccordion = document.querySelector('.mobile-nav-item.open');
    if (activeAccordion) {
        const container = activeAccordion.querySelector('.submenu-container');
        if (container && container.style.maxHeight !== container.scrollHeight + 'px') {
        container.style.maxHeight = container.scrollHeight + 'px';
        }
    }
});


allMobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        if (mobileOverlay.classList.contains('active')) {
        setTimeout(() => {
            closeDrawer();
        }, 80);
        }
    });
});
      

// Focus editor on load
editor.focus();

// Handle toolbar button clicks
toolbarButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const command = this.getAttribute('data-command');
        const value = this.getAttribute('data-value');
        
        // Save current selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        // Execute command
        if (value) {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, null);
        }
        
        // Check if the button should be active
        updateActiveButtons();
        
        // Restore focus to editor
        editor.focus();
    });
});

// Update active buttons based on current selection
function updateActiveButtons() {
    toolbarButtons.forEach(button => {
        const command = button.getAttribute('data-command');
        const value = button.getAttribute('data-value');
        
        if (command === 'formatBlock') {
            const blockElement = document.queryCommandValue('formatBlock');
            if (blockElement === value) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        } else {
            if (document.queryCommandState(command)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    });
}

// Show link dialog
insertLinkBtn.addEventListener('click', function() {
    // Save current selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        currentRange = selection.getRangeAt(0);
    }
    
    linkDialog.style.display = 'block';
    overlayTextEditor.style.display = 'block';
    linkUrlInput.focus();
});

// Insert link
insertLinkBtnDialog.addEventListener('click', function() {
    const url = linkUrlInput.value.trim();
    if (url) {
        // Restore selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(currentRange);
        
        // Create link
        document.execCommand('createLink', false, url);
        
        // Close dialog
        linkDialog.style.display = 'none';
        overlayTextEditor.style.display = 'none';
        linkUrlInput.value = '';
        
        // Focus editor
        editor.focus();
    }
});

// Cancel link insertion
cancelLinkBtn.addEventListener('click', function() {
    linkDialog.style.display = 'none';
    overlayTextEditor.style.display = 'none';
    linkUrlInput.value = '';
    editor.focus();
});

// Update button states when selection changes
// document.addEventListener('selectionchange', function() {
//     updateActiveButtons();
// });

// Handle paste events to clean up formatting
editor.addEventListener('paste', function(e) {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    
});

// Add this with your other event listeners
editor.addEventListener('input', function() {

});



// Event Listeners
manageSectionsBtn.addEventListener('click', toggleManageSections);
templatesBtn.addEventListener('click', () => toggleModal(templatesModal));
downloadBtn.addEventListener('click', downloadResume);
applySectionsBtn.addEventListener('click', applySectionChanges);

// Edit buttons (delegated event listener)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
        const btn = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
        const section = btn.getAttribute('data-section');
        openEditModal(section);
    }
    
    if (e.target.classList.contains('add-btn') || e.target.closest('.add-btn')) {
        const btn = e.target.classList.contains('add-btn') ? e.target : e.target.closest('.add-btn');
        const section = btn.getAttribute('data-section');
        addNewItem(section);
    }
    
    if (e.target.classList.contains('move-up-btn') || e.target.closest('.move-up-btn')) {
        const btn = e.target.classList.contains('move-up-btn') ? e.target : e.target.closest('.move-up-btn');
        const section = btn.getAttribute('data-section');
        moveSectionUp(btn.closest('.resume-section'));
    }
    
    if (e.target.classList.contains('move-down-btn') || e.target.closest('.move-down-btn')) {
        const btn = e.target.classList.contains('move-down-btn') ? e.target : e.target.closest('.move-down-btn');
        const section = btn.getAttribute('data-section');
        moveSectionDown(btn.closest('.resume-section'));
    }
});

// Modal close buttons
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal-overlay');
        toggleModal(modal);
    });
});

// Modal cancel buttons
document.getElementById('cancelContact').addEventListener('click', () => toggleModal(contactModal));
document.getElementById('cancelExperience').addEventListener('click', () => toggleModal(experienceModal));
document.getElementById('cancelSkills').addEventListener('click', () => toggleModal(skillsModal));
document.getElementById('cancelEducation').addEventListener('click', () => toggleModal(educationModal));
document.getElementById('cancelSummary').addEventListener('click', () => toggleModal(summaryModal));
document.getElementById('cancelLanguages').addEventListener('click', () => toggleModal(languagesModal));
document.getElementById('cancelCertificates').addEventListener('click', () => toggleModal(certificatesModal));
document.getElementById('cancelAwards').addEventListener('click', () => toggleModal(awardsModal));
document.getElementById('cancelIntrest').addEventListener('click', () => toggleModal(intrestModal));
document.getElementById('cancelProject').addEventListener('click', () => toggleModal(projectModal));
document.getElementById('cancelTemplates').addEventListener('click', () => toggleModal(templatesModal));

// Form submissions
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateContactInfo();
    toggleModal(contactModal);
});

document.getElementById('experienceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateExperience();
    toggleModal(experienceModal);
});

document.getElementById('skillsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateSkills();
    toggleModal(skillsModal);
});

document.getElementById('educationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateEducation();
    toggleModal(educationModal);
});

document.getElementById('summaryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateSummary();
    toggleModal(summaryModal);
});

document.getElementById('languagesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateLanguages();
    toggleModal(languagesModal);
});


document.getElementById('certificatesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateCertificates();
    toggleModal(certificatesModal);
});

document.getElementById('awardsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateAwards();
    toggleModal(awardsModal);
});


document.getElementById('editExperienceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateEditExperience(e);

    // toggleModal(contactModal);
});



document.getElementById('editEducationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateEditEducation(e);

    // toggleModal(contactModal);
});

document.getElementById('intrestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateIntrest();
    toggleModal(intrestModal);
});

document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    updateProjects();
    toggleModal(projectModal);
});

// Template selection
document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', function() {
        // Remove any existing selected class
        document.querySelectorAll('.template-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        this.classList.add('selected');
    });
});

document.getElementById('applyTemplate').addEventListener('click', function() {
    const selectedTemplate = document.querySelector('.template-card.selected');
    const selectedColor = localStorage.getItem("theme-primary-color")
    
    if (selectedTemplate && selectedColor) {
        toggleModal(templatesModal);
    } 

    else {
        alert('Please select a template or a theme color first');
    }
});

// Functions
function toggleManageSections() {
    if (manageSectionsSidebar.style.display === 'none' || !manageSectionsSidebar.style.display) {
        manageSectionsSidebar.style.display = 'block';
        manageSectionsBtn.classList.add('active');
    } else {
        manageSectionsSidebar.style.display = 'none';
        manageSectionsBtn.classList.remove('active');
    }
    scrollToBottom()
}

function scrollToBottom() {
  // Checks if the screen width is mobile (less than 768px)
  if (window.innerWidth <= 978) {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
}

function toggleModal(modal) {
    modal.classList.toggle('active');
    document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : 'auto';
}

function openEditModal(section) {
    switch(section) {
        case 'contact':
            toggleModal(contactModal);
            break;
        case 'experience':
            toggleModal(experienceModal);
            break;
        case 'skills':
            toggleModal(skillsModal);
            break;
        case 'education':
            toggleModal(educationModal);
            break;
        case 'summary':
            toggleModal(summaryModal);
            break;
        case 'languages':
            toggleModal(languagesModal);
            break;
        case 'certificates':
            toggleModal(certificatesModal);
            break;
        case 'awards':
            toggleModal(awardsModal);
            break;

        case 'intrests':
            toggleModal(intrestModal);
            break;

        case 'project':
            toggleModal(projectModal);
            break;
    }
}

async function updateContactInfo() {
    const name =  document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const obj = {
        name: name,
        phone: phone,
        email: email
    }
    const token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateContactInfo`, obj, { headers: { Authorization: token } })
    document.getElementById('contactName').textContent = response.data.updatedUser.username;
    document.getElementById('contactPhone').textContent = response.data.updatedUser.mobile;
    document.getElementById('contactEmail').textContent = response.data.updatedUser.email;
}



function generateId(category) {
    if(category==="experience"){
        return `exp-${Date.now()}${Math.floor(Math.random()*100)/100}`
    }
    else if(category ==="project"){
        return `pro-${Date.now()}${Math.floor(Math.random()*100)/100}`

    }
    else{ 
      return `edu-${Date.now()}${Math.floor(Math.random()*100)/100}`
    }
    
}

// Function to create a new experience item
function createExperienceItem(jobTitle, company, duration, description, uid) {
    console.log(description)
    const experienceItem = document.createElement('div');
    const experienceDescription = document.createElement("ul")
    experienceItem.className = 'experience-item';
    experienceDescription.className = "experience-description"

    description.forEach(desc=>{
        console.log(desc)
        const descriptionItem = document.createElement("li")
        descriptionItem.textContent = desc
        console.log(descriptionItem)
        experienceDescription.appendChild(descriptionItem)
    })
    experienceItem.dataset.id  = generateId("experience")
    experienceItem.id = uid;



    experienceItem.innerHTML = `
        <div class="experience-item-controls">
            <button class="move-btn move-up-btn-experience">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="move-btn move-down-btn-experience">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button class="edit-btn-experience">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn-experience">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        <h3 class="experience-title">${jobTitle}</h3>
        <div class="experience-company">${company}</div>
        <div class="experience-duration">${duration}</div>
    `;

    experienceItem.appendChild(experienceDescription)
    

    // Add event listeners to the controls
    const moveUpBtn = experienceItem.querySelector('.move-up-btn-experience');
    const moveDownBtn = experienceItem.querySelector('.move-down-btn-experience');
    const deleteBtn = experienceItem.querySelector('.delete-btn-experience');
    const editBtn = experienceItem.querySelector(".edit-btn-experience")
    moveUpBtn.addEventListener('click', () => moveExperienceItem(experienceItem, 'up'));
    moveDownBtn.addEventListener('click', () => moveExperienceItem(experienceItem, 'down'));
    deleteBtn.addEventListener('click', () => deleteExperienceItem(experienceItem));

    editBtn.addEventListener('click', function(e) {
        const experienceItem = this.closest('.experience-item');
        openModalWithData(experienceItem, e);
    });
    
    return experienceItem;
}


function createEducationItem(degree, institution, duration, euid){
    const educationItem = document.createElement('div');
    educationItem.className = 'education-item';
    educationItem.dataset.id  = generateId("education")
    educationItem.id = euid

    educationItem.innerHTML = `
        <div class="education-item-controls">
            <button class="move-btn move-up-btn-education">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="move-btn move-down-btn-education">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button class="edit-btn-education">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn-education">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        <h3 class="education-degree">${degree}</h3>
        <div class="education-institution">${institution}</div>
        <div class="education-duration">${duration}</div>
    `;

    // Add event listeners to the controls
    const moveUpBtn = educationItem.querySelector('.move-up-btn-education');
    const moveDownBtn = educationItem.querySelector('.move-down-btn-education');
    const deleteBtn = educationItem.querySelector('.delete-btn-education');
    const editBtn = educationItem.querySelector(".edit-btn-education")
    
    moveUpBtn.addEventListener('click', () => moveEducationItem(educationItem, 'up'));
    moveDownBtn.addEventListener('click', () => moveEducationItem(educationItem, 'down'));
    deleteBtn.addEventListener('click', () => deleteEducationItem(educationItem));

    editBtn.addEventListener('click', function(e) {
        const educationItem = this.closest('.education-item');
        openEducationModalWithData(educationItem, e);
    });

    return educationItem;

}


// Function to create a new experience item
function createProjectItem(projectTitle, projectDescription, projectDuration, projectEditor, uid) {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item';
    projectItem.dataset.id  = generateId("project")
    projectItem.id = uid;

    projectItem.innerHTML = `
        <div class="project-item-controls">
            <button class="move-btn move-up-btn-project">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="move-btn move-down-btn-project">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button class="edit-btn-project">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn-project">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
        <h3 class="project-title">${projectTitle}</h3>
        <div class="project-company">${projectDescription}</div>
        <div class="project-duration">${projectDuration}</div>
        <div class="project-description">
            <p>${projectEditor}</p>
        </div>
    `;
    
    // Add event listeners to the controls
    const moveUpBtn = projectItem.querySelector('.move-up-btn-project');
    const moveDownBtn = projectItem.querySelector('.move-down-btn-project');
    const deleteBtn = projectItem.querySelector('.delete-btn-project');
    const editBtn = projectItem.querySelector(".edit-btn-project")
    moveUpBtn.addEventListener('click', () => moveProjectItem(projectItem, 'up'));
    moveDownBtn.addEventListener('click', () => moveProjectItem(projectItem, 'down'));
    deleteBtn.addEventListener('click', () => deleteProjectItem(projectItem));

    editBtn.addEventListener('click', function(e) {
        const projectItem = this.closest('.project-item');
        console.log(projectItem)
        openProjectModalWithData(projectItem, e);
    });
    
    return projectItem;
}

function openProjectModalWithData(projectItem, e){
    console.log(projectItem, e)
}   


function openEducationModalWithData(educationItem, e){
    const id = educationItem.getAttribute("data-id")
    const euid = educationItem.getAttribute("id")
    localStorage.setItem("eduId", id)
    localStorage.setItem("edu-id", euid)
    const degree = educationItem.querySelector('.education-degree').textContent;
    const institution = educationItem.querySelector('.education-institution').textContent;
    const duration = educationItem.querySelector('.education-duration').textContent;

    document.getElementById('editDegree').value = degree;
    document.getElementById('editInstitution').value = institution;
    document.getElementById('editDuration').value = duration;

    toggleEditEducationModal();

}

function openModalWithData(experienceItem, e) {
        console.log(experienceItem)
        const id = experienceItem.getAttribute("data-id")
        const uid = experienceItem.getAttribute("id")
        localStorage.setItem("expId", id)
        localStorage.setItem("exp-id", uid)
        const title = experienceItem.querySelector('.experience-title').textContent;
        const company = experienceItem.querySelector('.experience-company').textContent;
        const duration = experienceItem.querySelector('.experience-duration').textContent;
        const description = experienceItem.querySelector('.experience-description').innerText;
        console.log(description)
        
	    document.getElementById('editJobTitle').value = title;
        document.getElementById('editCompany').value = company;
        document.getElementById('editjobDuration').value = duration;
        document.getElementById('editDescription').value = description;

        toggleEditExperienceModal();
}

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);



	// Toggle modal
    function toggleEditExperienceModal() {
        editExperiencemodal.classList.toggle('active');
    }

    function toggleEditEducationModal() {
        editEducationModal.classList.toggle('active');
    }

    	// Close modal
    function closeModal() {
        editExperiencemodal.classList.remove('active');
    }

    function closeEduModal() {
        editEducationModal.classList.remove('active');
    }



// Function to delete an experience item
async function deleteExperienceItem(item) {
    console.log(item)
     const token = localStorage.getItem("token")
    if(!token) {
        showToast("Not Authenticated, Login Again")
        window.location.href ="./Login"
        return
    }
    let payload = {
        id: item.id,
        fallbackId: item.dataset.id
    }

    try { 
        const response = await axios.delete(`${API_URL}/resume/deleteExperienceItem`, {
            headers: {
                "Authorization": token
            },
            data: payload
        })
        console.log(response)

        if(response.status===200){
            item.remove();
            showToast("Experience deleted successfully!")
        }
    }
    catch(error){
        console.error("Delete failed:", error);
        const errorMsg = error.response?.data || "Failed to delete item";
        showToast(errorMsg);
    }
}

// Function to move experience item up or down
function moveExperienceItem(item, direction) {
    // Get the experience section container
    console.log("exp", direction)
    const experienceSection = document.querySelector('#experienceSection .section-content');
    console.log(experienceSection)
    // Validate we're working within the experience section
    if (!experienceSection || !experienceSection.contains(item)) {
        return; // Exit if item isn't in experience section
    }
    
    // Only proceed if this is a direct child of the experience container
    if (item.parentNode !== experienceSection) {
        return;
    }

    // Perform the move operation
    if (direction === 'up') {
        const prev = item.previousElementSibling;
        if (prev) {
            experienceSection.insertBefore(item, prev);
        }
    } else if (direction === 'down') {
        const next = item.nextElementSibling;
        if (next) {
            experienceSection.insertBefore(next, item);
        }
    }
}



function moveProjectItem(item, direction) {
    // Get the experience section container
    const projectSection = document.querySelector('#projectSection .section-content');
    
    // Validate we're working within the experience section
    if (!projectSection || !projectSection.contains(item)) {
        return; // Exit if item isn't in experience section
    }
    
    // Only proceed if this is a direct child of the experience container
    if (item.parentNode !== projectSection) {
        return;
    }

    // Perform the move operation
    if (direction === 'up') {
        const prev = item.previousElementSibling;
        if (prev) {
            projectSection.insertBefore(item, prev);
        }
    } else if (direction === 'down') {
        const next = item.nextElementSibling;
        if (next) {
            projectSection.insertBefore(next, item);
        }
    }
}



async function deleteProjectItem(item) {
    const token = localStorage.getItem("token")
    if(!token) {
        showToast("Not Authenticated, Login Again")
        window.location.href ="./Login"
        return
    }
    let payload = {
        id: item.id,
        fallbackId: item.dataset.id
    }

    try { 
        const response = await axios.delete(`${API_URL}/resume/deleteProjectItem`, {
            headers: {
                "Authorization": token
            },
            data: payload
        })
        console.log(response)

        if(response.status===200){
            item.remove();
            showToast("Project deleted successfully!")
        }
    }
    catch(error){
        console.error("Delete failed:", error);
        const errorMsg = error.response?.data || "Failed to delete item";
        showToast(errorMsg);
    }
}

async function updateExperience() {
    const jobTitle = document.getElementById('jobTitle').value;
    const company = document.getElementById('company').value;
    const duration = document.getElementById('jobDuration').value;
    const description = document.getElementById('editor').innerHTML;
    const descriptionArr = description.replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')     
    .replace(/<[^>]+>/g, '')       
    .split('\n')                   
    .map(item => item.trim())      
    .filter(item => item.length > 0)
    console.log(descriptionArr)
    const date = duration.split("-")
     const startDate = date[0]
     const endDate = date[1]
    // In a real app, you would update the specific experience item being edited
    // For this demo, we'll just update the first experience item
    const newExperience = createExperienceItem(jobTitle, company, duration, descriptionArr);
     const expId = newExperience.getAttribute("data-id")


    let obj = {
        title: jobTitle,
        company: company,
        startDate: startDate,
        endDate: endDate,
        description: descriptionArr,
        experienceId: expId
    }

    console.log(obj)
    document.querySelector('#experienceSection .section-content').appendChild(newExperience);

    const token = localStorage.getItem("token")
    const response = await axios.post(`${API_URL}/resume/updateExperience`, obj, {headers: {Authorization:token}})
    
}

async function updateSkills() {
    const skillsInput = document.getElementById('skillsInput').value;
    const skills = skillsInput.split(',').map(skill => skill.trim());
    console.log(skillsInput.split(","))

    const skillsList = document.querySelector('.skills-list');
    skillsList.innerHTML = '';
    
    skills.forEach(skill => {
        if (skill) {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsList.appendChild(skillTag);
        }
    });


    let obj = {
        skill: skills
    }
    let token = localStorage.getItem("token")

    const response =  await axios.post(`${API_URL}/resume/updateSkills`, obj, {headers:{Authorization:token}})
}

async function updateEducation() {
    const degree = document.getElementById('degree').value;
    const institution = document.getElementById('institution').value;
    const duration = document.getElementById('educationDuration').value;

    const newEducation = createEducationItem(degree, institution, duration)
    const id = newEducation.getAttribute("data-id")
    // In a real app, you would update the specific education item being edited
    document.querySelector('#educationSection .section-content').appendChild(newEducation);

    let obj = {
        degree: degree,
        institution: institution,
        duration: duration,
        id: id
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateEducation`, obj, {headers:{Authorization:token}})
}

// Function to move experience item up or down
function moveEducationItem(item, direction) {
    // Get the experience section container
    const educationSection = document.querySelector('#educationSection .section-content');
    
    // Validate we're working within the experience section
    if (!educationSection || !educationSection.contains(item)) {
        return; // Exit if item isn't in experience section
    }
    
    // Only proceed if this is a direct child of the experience container
    if (item.parentNode !== educationSection) {
        return;
    }

    // Perform the move operation
    if (direction === 'up') {
        const prev = item.previousElementSibling;
        if (prev) {
            educationSection.insertBefore(item, prev);
        }
    } else if (direction === 'down') {
        const next = item.nextElementSibling;
        if (next) {
            educationSection.insertBefore(next, item);
        }
    }
}


    // Toggle modal
    function toggleEditExperienceModal() {
        editExperiencemodal.classList.toggle('active');
    }

async function deleteEducationItem(item) {
    console.log(item, item.id, item.dataset.id)
    const token = localStorage.getItem("token")
    if(!token) {
        showToast("Not Authenticated, Login Again")
        window.location.href ="./Login"
        return
    }
    let payload = {
        id: item.id,
        fallbackId: item.dataset.id
    }

    try { 
        const response = await axios.delete(`${API_URL}/resume/deleteEducationItem`, {
            headers: {
                "Authorization": token
            },
            data: payload
        })
        console.log(response)

        if(response.status===200){
            item.remove();
            showToast("Education deleted successfully!")
        }
    }
    catch(error){
        console.error("Delete failed:", error);
        const errorMsg = error.response?.data || "Failed to delete item";
        showToast(errorMsg);
    }
}

async function updateSummary() {
    const summaryText = document.getElementById('summaryText').value;
    document.getElementById('summaryContent').textContent = summaryText;
    let obj = {
        summary: summaryText
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateSummary`, obj, {headers:{Authorization:token}})

}

async function updateLanguages() {
    const languagesInput = document.getElementById('languagesInput').value;
    console.log(languagesInput)
    const languages = languagesInput.split(',').map(lang => lang.trim());
    const languagesList = document.getElementById('languagesList');
    languagesList.innerHTML = '';
    
    languages.forEach(lang => {
        if (lang) {
            const langTag = document.createElement('span');
            langTag.className = 'skill-tag';
            langTag.textContent = lang;
            languagesList.appendChild(langTag);
        }
    });

    let obj = {
        language: languages
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateLanguages`, obj, {headers:{Authorization:token}})
}

async function updateCertificates() {
    const certificatesInput = document.getElementById('certificatesInput').value;
    const certificates = certificatesInput.split('\n').filter(cert => cert.trim());
    console.log(certificates)

    const certificatesList = document.getElementById('certificatesList');
    certificatesList.innerHTML = '';
    
    certificates.forEach(cert => {
        if (cert) {
            const li = document.createElement('li');
            li.textContent = cert;
            certificatesList.appendChild(li);
        }
    });

    let obj = {
        certificate: certificates
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateCertificates`, obj, {headers:{Authorization:token}})
}

async function updateAwards() {
    const awardsInput = document.getElementById('awardsInput').value;
    const awards = awardsInput.split('\n').filter(award => award.trim());
    
    const awardsList = document.getElementById('awardsList');
    awardsList.innerHTML = '';
    
    awards.forEach(award => {
        if (award) {
            const li = document.createElement('li');
            li.textContent = award;
            awardsList.appendChild(li);
        }
    });

    let obj = {
        awards: awards
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateAwards`, obj, {headers:{Authorization:token}})
}

async function updateIntrest(){
    const intrestInput = document.getElementById('intrestInput').value;
    const intrests = intrestInput.split(',').map(lang => lang.trim());
    const intrestsList = document.getElementById('intrestList');
    intrestsList.innerHTML = '';

        
    intrests.forEach(int => {
        if (int) {
            const intTag = document.createElement('span');
            intTag.className = 'intrest-tag';
            intTag.textContent = int;
            intrestsList.appendChild(intTag);
        }
    });

    let obj = {
        intrest: intrestInput
    }
    let token = localStorage.getItem("token")

    const response = await axios.post(`${API_URL}/resume/updateIntrest`, obj, {headers:{Authorization:token}})
}

async function updateProjects(){
    const projectTitle = document.getElementById('projectTitle').value;
    const projectDescription = document.getElementById('projectDescription').value;
    const projectDuration = document.getElementById('projectDuration').value;
    const projectEditor = document.getElementById('projectEditor').innerHTML;

    const date = projectDuration.split("-")
     const startDate = date[0]
     const endDate = date[1]
    // In a real app, you would update the specific experience item being edited
    // For this demo, we'll just update the first experience item
    const newProject = createProjectItem(projectTitle, projectDescription, projectDuration, projectEditor);
     const proId = newProject.getAttribute("data-id")

     let obj = {
        title: projectTitle,
        description: projectDescription,
        startDate: startDate,
        endDate: endDate,
        summary: projectEditor,
        projectId: proId
    }
    console.log(obj)
    document.querySelector('#projectSection .section-content').appendChild(newProject);

    const token = localStorage.getItem("token")
    const response = await axios.post(`${API_URL}/resume/updateProject`, obj, {headers: {Authorization:token}})
}



  async function updateEditExperience(e){
    // editjobDuration
    const editJob = document.getElementById('editJobTitle').value
    const editCompany = document.getElementById('editCompany').value
    const editjobDuration = document.getElementById('editjobDuration').value
    const editDescription = document.getElementById('editDescription').value

    const date = editjobDuration.split("-")
    const startDate = date[0]
    const endDate = date[1] 
    const id = localStorage.getItem("expId")
    const uid = localStorage.getItem("exp-id")


    const token = localStorage.getItem("token");
    let obj = {
        editJob: editJob,
        editCompany: editCompany,
        startDate: startDate,
        endDate: endDate, 
        editDescription: editDescription,
        id: id, 
        uid: uid
    }
    console.log(obj)
    const response = await axios.post(`${API_URL}/resume/updateEditExperience`, obj, {headers: {Authorization:token}})

    if(uid!="undefined"){
        const expItem = document.getElementById(uid)
        console.log(expItem)
        const experience = response.data.result.experience.find(exp => exp._id === uid);
        console.log(experience)
        expItem.querySelector('.experience-title').textContent = experience.role;
        // Update company
        expItem.querySelector('.experience-company').textContent = experience.company;
        // Update duration
        expItem.querySelector('.experience-duration').textContent = `${experience.startDate.trim()} - ${experience.endDate.trim()} `;
        // Update description
        console.log(experience.description[0])
        expItem.querySelector('.experience-description li').textContent = experience.description[0];
    }
    else{
        const editExperienceItem = document.querySelector(`.experience-item[data-id="${id}"]`);

        if (editExperienceItem){
            // Update title
            editExperienceItem.querySelector('.experience-title').textContent = editJob;
            // Update company
            editExperienceItem.querySelector('.experience-company').textContent = editCompany;
            // Update duration
            editExperienceItem.querySelector('.experience-duration').textContent = editjobDuration;
            // Update description
            editExperienceItem.querySelector('.experience-description li').textContent = editDescription;
        }
    }
   
    closeModal()
}

async function updateEditEducation(e){
    const editDegree = document.getElementById('editDegree').value
    const editInstitution = document.getElementById('editInstitution').value
    const editDuration = document.getElementById('editDuration').value
    const id = localStorage.getItem("eduId")
    const euid = localStorage.getItem("edu-id")
    console.log(editDegree, editInstitution, editDuration, id, euid)
    

    const token = localStorage.getItem("token");
    let obj = {
        editDegree: editDegree,
        editInstitution: editInstitution,
        editDuration:editDuration,
        id: id, 
        euid: euid
    }

    const response = await axios.post(`${API_URL}/resume/updateEditEducation`, obj, {headers: {Authorization:token}})


    
    if(euid!="undefined"){
        const eduItem = document.getElementById(euid)
        console.log(eduItem)
        const education = response.data.result.education.find(edu => edu._id === euid);
        eduItem.querySelector('.education-degree').textContent = editDegree;
        // Update company
        eduItem.querySelector('.education-institution').textContent = editInstitution;
        // Update duration
        eduItem.querySelector('.education-duration').textContent = editDuration;
    }
    else{
        const editEducationItem = document.querySelector(`.education-item[data-id="${id}"]`);

        if (editEducationItem){
            // Update title
            editEducationItem.querySelector('.education-degree').textContent = editDegree;
            // Update company
            editEducationItem.querySelector('.education-institution').textContent = editInstitution;
            // Update duration
            editEducationItem.querySelector('.education-duration').textContent = editDuration;
        }

    }
   
    
    closeEduModal()

}


function applySectionChanges() {
    // Summary section


    if (summaryToggle.checked && !document.getElementById('summarySection')) {
        // Insert summary section after contact info
        const contactSection = document.getElementById('contactInfoSection');
        contactSection.insertAdjacentHTML('afterend', sectionTemplates.summary);
    } else if (!summaryToggle.checked && document.getElementById('summarySection')) {
        document.getElementById('summarySection').remove();
    }

    if (experienceToggle.checked && !document.getElementById('experienceSection')) {
        // Insert summary section after contact info
        const educationSection = document.getElementById('educationSection');
        educationSection.insertAdjacentHTML('beforeend', sectionTemplates.experience);
    } else if (!experienceToggle.checked && document.getElementById('experienceSection')) {
        document.getElementById('experienceSection').remove();
    }

    
    
    // Certificates section
    if (certificatesToggle.checked && !document.getElementById('certificatesSection')) {
        // Add certificates section at the end
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.certificates);
    } else if (!certificatesToggle.checked && document.getElementById('certificatesSection')) {
        document.getElementById('certificatesSection').remove();
    }
    
    // Awards section
    if (awardsToggle.checked && !document.getElementById('awardsSection')) {
        // Add awards section at the end
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.awards);
    } else if (!awardsToggle.checked && document.getElementById('awardsSection')) {
        document.getElementById('awardsSection').remove();
    }

        // Languages section
    if (languagesToggle.checked && !document.getElementById('languagesSection')) {
        // Add languages section at the end
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.languages);
    } else if (!languagesToggle.checked && document.getElementById('languagesSection')) {
        document.getElementById('languagesSection').remove();
    }

    // Intrests section
    if (intrestToggle.checked && !document.getElementById('intrestsSection')) {
        // Insert summary section after contact info
        resumePreview.insertAdjacentHTML('beforeend', sectionTemplates.intrests);
    } else if (!intrestToggle.checked && document.getElementById('intrestsSection')) {
        document.getElementById('intrestsSection').remove();
    }

    // Projects section
    if (projectToggle.checked && !document.getElementById('projectSection')) {
        // Insert summary section after contact info
        const educationSection = document.getElementById('educationSection');
        educationSection.insertAdjacentHTML('afterend', sectionTemplates.projects);
    } else if (!projectToggle.checked && document.getElementById('projectSection')) {
        document.getElementById('projectSection').remove();
    }


    
    // Hide the sidebar after applying changes
    toggleManageSections();
}

function addNewItem(section) {
    switch(section) {
        case 'experience':
            const experienceSection = document.getElementById('experienceSection');
            const newExperienceItem = document.createElement('div');
            newExperienceItem.className = 'experience-item';
            newExperienceItem.innerHTML = `
                <h3 class="experience-title">New Position</h3>
                <div class="experience-company">Company Name</div>
                <div class="experience-duration">Month Year - Present</div>
                <div class="experience-description">
                    <p>Describe your responsibilities and achievements in this position.</p>
                </div>
            `;

            openEditModal("experience")
            break;
            
        case 'education':
            const educationSection = document.getElementById('educationSection');
            const newEducationItem = document.createElement('div');
            newEducationItem.className = 'education-item';
            newEducationItem.innerHTML = `
                <h3 class="education-degree">Degree/Certificate</h3>
                <div class="education-institution">Institution Name</div>
                <div class="education-duration">Year - Year</div>
            `;
            openEditModal("education")
            break;

        case 'project':
            openEditModal("project")
            break
    }
}

function moveSectionUp(section) {
    const prevSection = section.previousElementSibling;
    // Don't allow moving above contact info section
    if (prevSection && prevSection.id !== 'contactInfoSection') {
        section.parentNode.insertBefore(section, prevSection);
    }
}

function moveSectionDown(section) {
    const nextSection = section.nextElementSibling;
    if (nextSection) {
        section.parentNode.insertBefore(nextSection, section);
    }
}

async function downloadResume() {
    try {
        const token = localStorage.getItem("token")
        if(!token){
            showToast("Not Authenticated, Login again")
            setTimeout(()=>{
            window.location.href="./login"
            }, 2000)
        }

        let selectedColor = localStorage.getItem("theme-primary-color") || "corporate";
        let theme = localStorage.getItem("theme") || "modern-theme"



        const resume = await axios.get(`${API_URL}/resume/downloadResume`, {
            params: {
                color: selectedColor,
                theme: theme
            },
            headers: {
                Authorization: token
            },
        });

        console.log(resume)

        if(resume.status === 200){
            console.log(resume.data.s3Data.url, resume.data.s3Data.fileName)
            downloadFile(resume.data.s3Data.url, resume.data.s3Data.fileName)
        }

    } catch (error) {

    }
}

function downloadFile(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName; // Suggests a filename to the browser
  link.target = '_blank'; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // Cleanup
}

async function downloadPDF(url, fileName) {
  try {
    // 1. Fetch the file data
    const response = await fetch(url);
    const blob = await response.blob();
    
    // 2. Create a local URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // 3. Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || 'document.pdf';
    
    document.body.appendChild(link);
    link.click();
    
    // 4. Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl); // Free up memory
  } catch (error) {
    console.error('Download failed:', error);
  }
}



arr.forEach((color, index)=>{
    const id = `${colorTheme[index]}`
    let radio = document.createElement("input")
    radio.type = "radio";
    radio.name = "colorpicker";
    radio.value = color;
    radio.id = id;
    radio.className = "color"
     
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.style.backgroundColor = color;
    colorGradient.appendChild(radio)
    colorGradient.appendChild(label);

})
 
colorGradient.addEventListener("click", (target)=>{
    const selectedColor = target.target.id
    console.log(selectedColor)
    localStorage.setItem("theme-primary-color", selectedColor)
})


allTemplatesTheme.addEventListener("click", (event)=>{
    const selectedTheme = event.target.id
    console.log(selectedTheme)
    localStorage.setItem("theme", selectedTheme)
    switch(selectedTheme) {
        case 'modern-theme':
            document.getElementById("modern").checked = true
            break;
        case 'classic-theme':
            document.getElementById("classic").checked = true
            break;
        
    }
})