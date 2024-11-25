document.addEventListener('DOMContentLoaded', function () {
    const semesterDropdown = document.getElementById('semester-dropdown');
    const subjectDropdown = document.getElementById('subject-dropdown');
    const lectureTableBody = document.querySelector('#lecture-table tbody');
    const pdfSection = document.getElementById('pdf-section');
    const videoSection = document.getElementById('video-section');
    const pdfViewer = document.getElementById('pdf-viewer');
    const videoViewer = document.getElementById('video-viewer');
    const downloadButton = document.getElementById('download-button');
    const closePdfViewerButton = document.getElementById('close-pdf-viewer');
    const closeVideoViewerButton = document.getElementById('close-video-viewer');
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('menu');

    let semesterSubjects = {};

    // Toggle menu visibility
    menuButton.addEventListener('click', function (event) {
        event.stopPropagation();
        menu.classList.toggle('hidden');
        menu.style.display = menu.classList.contains('hidden') ? 'none' : 'block';
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!menuButton.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.add('hidden');
            menu.style.display = 'none';
        }
    });

    // Load JSON data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            semesterSubjects = data;
            populateSemesters();
        })
        .catch(error => console.error('Error loading JSON data:', error));

    // Populate semesters in the dropdown
    function populateSemesters() {
        Object.keys(semesterSubjects).forEach(semester => {
            const option = document.createElement('option');
            option.value = semester;
            option.textContent = semester;
            semesterDropdown.appendChild(option);
        });
    }

    // Handle semester selection
    semesterDropdown.addEventListener('change', function () {
        const selectedSemester = semesterDropdown.value;
        if (selectedSemester) {
            populateSubjects(selectedSemester);
            document.getElementById('subject-selection').style.display = 'block';
        }
    });

    // Handle subject selection
    subjectDropdown.addEventListener('change', function () {
        const selectedSemester = semesterDropdown.value;
        const selectedSubject = subjectDropdown.value;
        if (selectedSubject) {
            populateLectures(selectedSemester, selectedSubject);
            document.getElementById('lecture-selection').style.display = 'block';
        }
    });

    // Populate subjects based on semester
    function populateSubjects(semester) {
        subjectDropdown.innerHTML = '<option value="" disabled selected>Choose your subject</option>';
        Object.keys(semesterSubjects[semester]).forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectDropdown.appendChild(option);
        });
    }

    // Populate lecture table based on subject
    function populateLectures(semester, subject) {
        lectureTableBody.innerHTML = '';
        semesterSubjects[semester][subject].forEach(lectureData => {
            const row = document.createElement('tr');

            // Serial Number column
            const serialCell = document.createElement('td');
            serialCell.textContent = lectureData.serialNumber;
            row.appendChild(serialCell);

            // PDF column with clickable lecture name
            const pdfCell = document.createElement('td');
            const pdfLink = document.createElement('a');
            pdfLink.href = '#';
            pdfLink.textContent = lectureData.lecture;
            pdfLink.setAttribute('data-pdf', lectureData.pdf);
            pdfLink.classList.add('pdf-link');
            pdfCell.appendChild(pdfLink);

            // HandNotes
            const handNotesCell = document.createElement('td');
            const handNotesLink = document.createElement('a');
            handNotesLink.href = lectureData.handNotes;
            handNotesLink.innerHTML = '<i class="bx bxs-book" style="color: green; font-size: 30px;"></i>';
            handNotesLink.target = '_blank';
            handNotesCell.appendChild(handNotesLink);

            // Video column
            const videoCell = document.createElement('td');
            const videoLink = document.createElement('a');
            videoLink.href = '#'; // Placeholder href
            videoLink.setAttribute('data-video', lectureData.video); // Store the video URL in a custom attribute
            videoLink.innerHTML = '<i class="bx bxl-youtube" style="color: red; font-size: 30px;"></i>';
            videoLink.classList.add('video-link');
            videoCell.appendChild(videoLink);
            
            // Add event listener to handle click
            videoLink.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                const videoUrl = event.target.closest('a').getAttribute('data-video');
                window.open(videoUrl, '_blank'); // Open the video in a new tab
            });
            

            // Online resources column
            const resourceCell = document.createElement('td');
            const resourceLink = document.createElement('a');
            resourceLink.href = lectureData.resources;
            resourceLink.innerHTML = '<i class="bx bx-book-open" style="font-size: 30px;"></i>';
            resourceLink.target = '_blank';
            resourceCell.appendChild(resourceLink);

            // Download button column
            const downloadCell = document.createElement('td');
            const downloadBtn = document.createElement('a');
            downloadBtn.href = convertToDownloadLink(lectureData.pdf); // Convert preview link to download link
            downloadBtn.innerHTML = '<i class="bx bxs-download" style="font-size: 30px;"></i>';
            downloadBtn.setAttribute('download', 'Lecture.pdf'); // Set default name for download
            downloadBtn.classList.add('download-btn');
            downloadCell.appendChild(downloadBtn);

            // Append cells to the row
            row.appendChild(serialCell);
            row.appendChild(pdfCell);
            row.appendChild(handNotesCell);
            row.appendChild(videoCell);
            row.appendChild(resourceCell);
            row.appendChild(downloadCell);

            // Append the row to the table body
            lectureTableBody.appendChild(row);
        });

        // Handle PDF link click to show in iframe
        document.querySelectorAll('.pdf-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const pdfPreviewUrl = this.getAttribute('data-pdf');
                const pdfDownloadUrl = convertToDownloadLink(pdfPreviewUrl); 
                if (pdfPreviewUrl) {
                    pdfViewer.src = pdfPreviewUrl;           
                    downloadButton.href = pdfDownloadUrl;    
                    pdfSection.style.display = 'block';      
                    videoSection.style.display = 'none';    
                    pdfSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to PDF section
                }
            });
        });

        // Function to convert Google Drive preview link to download link
        function convertToDownloadLink(previewUrl) {
            const fileIdMatch = previewUrl.match(/\/d\/(.+?)\//); // Extract file ID from preview link
            return fileIdMatch ? `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}` : previewUrl;
        }

        // Handle Video link click to show in iframe
        document.querySelectorAll('.video-link').forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const videoUrl = this.getAttribute('data-video');
                if (videoUrl) {
                    videoViewer.src = videoUrl;
                    videoSection.style.display = 'block';
                    pdfSection.style.display = 'none';
                    videoSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Close the PDF viewer
    closePdfViewerButton.addEventListener('click', function () {
        pdfSection.style.display = 'none';
        pdfViewer.src = '';
    });

    // Close the Video viewer
    closeVideoViewerButton.addEventListener('click', function () {
        videoSection.style.display = 'none';
        videoViewer.src = '';
    });
});