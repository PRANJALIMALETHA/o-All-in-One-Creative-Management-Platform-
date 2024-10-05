// Fetch all boards and display them in the card container
async function fetchBoards() {
    try {
        const response = await fetch('http://localhost:5000/boards');
        const boards = await response.json();

        const cardContainer = document.querySelector('.card-container');
        cardContainer.innerHTML = ''; // Clear existing cards

        boards.forEach(board => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.location.href = `../pint/pint.html`; // Adjust link as needed
            card.innerHTML = `
                <img src="${board.imagePath}" alt="${board.title}">
                <div class="card-title">${board.title}</div>
                <button onclick="deleteBoard('${board._id}', event)">Delete</button>
                <button onclick="showUpdateForm('${board._id}', '${board.title}', '${board.imagePath}'); event.stopPropagation();">Update</button>
            `;
            cardContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to fetch boards:', error);
    }
}

// Create a new board
async function createBoard(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const titleInput = document.getElementById('board-title');
    const imageInput = document.getElementById('board-image');

    formData.append('title', titleInput.value);
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:5000/boards', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const newBoard = await response.json();
            console.log('Board created:', newBoard);
            fetchBoards(); // Refresh the board list
        } else {
            console.error('Failed to create board');
        }
    } catch (error) {
        console.error('Error creating board:', error);
    }
}

// Show update form for a specific board
function showUpdateForm(id, title, imagePath) {
    const updateForm = document.getElementById('update-form');
    const titleInput = document.getElementById('update-board-title');
    const imageInput = document.getElementById('update-board-image');

    titleInput.value = title;
    imageInput.value = ''; // Reset file input
    updateForm.onsubmit = (event) => updateBoard(event, id);
    updateForm.style.display = 'block'; // Show update form
}

// Update a board
async function updateBoard(event, id) {
    event.preventDefault();
    
    const formData = new FormData();
    const titleInput = document.getElementById('update-board-title');
    const imageInput = document.getElementById('update-board-image');

    formData.append('title', titleInput.value);
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch(`http://localhost:5000/boards/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            const updatedBoard = await response.json();
            console.log('Board updated:', updatedBoard);
            fetchBoards(); // Refresh the board list
            document.getElementById('update-form').style.display = 'none'; // Hide update form
        } else {
            console.error('Failed to update board');
        }
    } catch (error) {
        console.error('Error updating board:', error);
    }
}

// Delete a board
async function deleteBoard(id, event) {
    event.stopPropagation(); // Prevent triggering the card click event

    try {
        const response = await fetch(`http://localhost:5000/boards/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const deletedBoard = await response.json();
            console.log('Board deleted:', deletedBoard);
            fetchBoards(); // Refresh the board list
        } else {
            console.error('Failed to delete board');
        }
    } catch (error) {
        console.error('Error deleting board:', error);
    }
}

// Fetch boards on page load
document.addEventListener('DOMContentLoaded', fetchBoards);
