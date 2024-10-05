// Handle displaying the board form
document.getElementById('create-button').addEventListener('click', () => {
    document.getElementById('board-form').classList.toggle('hidden');
});

async function addBoard() {
    const title = document.getElementById('board-title').value;
    const image = document.getElementById('board-image').files[0];

    if (!title) {
        alert('Please enter a title for the board.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    if (image) {
        formData.append('image', image);
    }

    try {
        const response = await fetch('/boards', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const newBoard = await response.json();
        window.location.href = '/board/board.html'; // Redirect after success
    } catch (error) {
        console.error('Error:', error.message);
        alert('Error adding board. Please try again.');
    }
}
