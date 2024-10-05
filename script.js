document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000';

    // Function to add a sticky note
    window.addStickyNote = async function() {
        let title = document.getElementById('sticky-title').value;
        let content = document.getElementById('sticky-content').value;

        // Split the content by commas to create list items
        let contentItems = content.split(',').map(item => item.trim());

        // Send a POST request to add the sticky note
        const response = await fetch(`${API_URL}/sticky-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content: contentItems }),
        });

        if (response.ok) {
            const newNote = await response.json();
            displayStickyNotes(); // Refresh the notes list
        } else {
            console.error('Error adding sticky note:', response.statusText);
        }

        // Clear inputs
        document.getElementById('sticky-title').value = '';
        document.getElementById('sticky-content').value = '';
    };

    // Function to add a module
    window.addModule = async function() {
        let title = document.getElementById('module-title').value;
        let content = document.getElementById('module-content').value;
        let files = document.getElementById('module-files').files;
    
        // Split the content by commas to create list items
        let contentItems = content.split(',').map(item => item.trim());
    
        let formData = new FormData();
        formData.append('title', title);
        formData.append('content', JSON.stringify(contentItems));
    
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
    
        // Send a POST request to add the module
        const response = await fetch(`${API_URL}/modules`, {
            method: 'POST',
            body: formData
        });
    
        if (response.ok) {
            const newModule = await response.json();
            displayModules(); // Refresh the modules list
        } else {
            console.error('Error adding module:', response.statusText);
        }
    
        // Clear inputs
        document.getElementById('module-title').value = '';
        document.getElementById('module-content').value = '';
        document.getElementById('module-files').value = '';
    };    

    // Function to fetch and display sticky notes
    async function displayStickyNotes() {
        const response = await fetch(`${API_URL}/sticky-notes`);
        const notes = await response.json();

        const container = document.getElementById('sticky-notes-container');
        container.innerHTML = ''; // Clear the container

        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'sticky-note';

            // Adding delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '❌';
            deleteButton.onclick = () => deleteStickyNote(note._id);

            noteDiv.innerHTML = `<h4 class="sticky-note-title">${note.title}</h4><ul>${note.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
            noteDiv.appendChild(deleteButton); // Append the delete button to the sticky note

            container.appendChild(noteDiv);
        });
    }

    // Function to delete a sticky note
    async function deleteStickyNote(noteId) {
        const response = await fetch(`${API_URL}/sticky-notes/${noteId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            displayStickyNotes(); // Refresh the notes list after deletion
        } else {
            console.error('Error deleting sticky note:', response.statusText);
        }
    }

    // Function to fetch and display modules
    async function displayModules() {
        const response = await fetch(`${API_URL}/modules`);
        const modules = await response.json();
    
        const container = document.getElementById('modules-container');
        container.innerHTML = ''; // Clear the container
    
        modules.forEach(module => {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module';
    
            // Adding delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '❌';
            deleteButton.onclick = () => deleteModule(module._id);
    
            const moduleContent = module.content.map(item => `
                <li>
                    ${item.className} 
                    <a class="view-btn" href="/${item.filePath}" target="_blank">View</a>
                </li>`).join('');
    
            moduleDiv.innerHTML = `
                <h4  class="moduleinnertitle">${module.title}</h4>
                <ul>${moduleContent}</ul>`;
            
            moduleDiv.appendChild(deleteButton); // Append the delete button to the module
    
            container.appendChild(moduleDiv);
        });
    }
    

    // Function to delete a module
    async function deleteModule(moduleId) {
        console.log('Deleting module with ID:', moduleId); // Log the moduleId
        const response = await fetch(`${API_URL}/modules/${moduleId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            displayModules(); // Refresh the modules list after deletion
        } else {
            console.error('Error deleting module:', response.statusText);
        }
    }

    // Initialize display of sticky notes and modules on page load
    displayStickyNotes();
    displayModules();

    // Functions to toggle input visibility
    document.querySelector('.toggle-button:nth-of-type(1)').addEventListener('click', () => {
        const inputDiv = document.getElementById('sticky-note-input');
        inputDiv.classList.toggle('hidden');
    });

    document.querySelector('.toggle-button:nth-of-type(2)').addEventListener('click', () => {
        const inputDiv = document.getElementById('module-input');
        inputDiv.classList.toggle('hidden');
    });
});
