const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');


// Create an Express app
const app = express();
const PORT = 5000; // Choose any port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));


// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/testing', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/module files/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });


// Middleware to serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));


// Route to serve the blue.html page
app.get('/blue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});


// Define Schema for Sticky Notes
const stickyNoteSchema = new mongoose.Schema({
    title: String,
    content: [String], // Changed content to be an array of strings
});

const StickyNote = mongoose.model('StickyNote', stickyNoteSchema);


//module schema
const moduleSchema = new mongoose.Schema({
    title: String,
    content: [
        {
            className: String, // Class name like "class1"
            filePath: String // Path to the associated file
        }
    ]
});

const Module = mongoose.model('Module', moduleSchema);

// Board Schema
const boardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imagePath: { type: String, default: 'path/to/default/image.jpg' }, // Default image path
});

const Board = mongoose.model('Board', boardSchema);



// Routes
// Route to add a Sticky Note
app.post('/blue/sticky-notes', async (req, res) => {
    const { title, content } = req.body;
    const newNote = new StickyNote({ title, content });
    await newNote.save();
    res.status(201).json(newNote);
});

// Route to get all Sticky Notes
app.get('/blue/sticky-notes', async (req, res) => {
    const notes = await StickyNote.find();
    res.status(200).json(notes);
});

app.post('/blue/modules', upload.array('files'), async (req, res) => {
    const { title, content } = req.body;

    const contentArray = JSON.parse(content); // Parse the content array

    // Associate the content with the uploaded files
    const moduleContent = contentArray.map((className, index) => ({
        className: className,
        filePath: req.files[index] ? req.files[index].path : null // Save the file path
    }));

    const newModule = new Module({
        title: title,
        content: moduleContent
    });

    await newModule.save();
    res.status(201).json(newModule);
});

app.get('/blue/modules', async (req, res) => {
    const modules = await Module.find();
    res.status(200).json(modules);
});



// Route to delete a Sticky Note
app.delete('/blue/sticky-notes/:id', async (req, res) => {
    const { id } = req.params;
    const deletedNote = await StickyNote.findByIdAndDelete(id);
    if (deletedNote) {
        res.status(200).json(deletedNote);
    } else {
        res.status(404).json({ message: 'Sticky Note not found' });
    }
});



// DELETE endpoint to delete a module by its ID
app.delete('/blue/modules/:id', async (req, res) => {
    try {
        const moduleId = req.params.id; // Get module ID from URL parameters

        // Find and delete the module by its ID
        const deletedModule = await Module.findByIdAndDelete(moduleId);

        // If no module is found, send a 404 error
        if (!deletedModule) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Respond with a success message if the deletion is successful
        res.status(200).json({ message: 'Module deleted successfully' });
    } catch (error) {
        // Handle server errors and send a 500 response
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Route to render create.html
app.get('/blue/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'create', 'create.html'));
});

app.post('/blue/create', upload.single('image'), async (req, res) => {
    const { title } = req.body;
    const imagePath = req.file ? req.file.path : 'uploads/default-image.jpg'; // Handle file upload and set a default image

    const newBoard = new Board({
        title: title,
        imagePath: imagePath,
        works: [] // Initialize empty works array
    });

    try {
        await newBoard.save();
        res.status(201).json(newBoard); // Send back the new board as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error creating board' }); // Handle error
    }
});


// Fetch all boards
// app.get('/blue/board', async (req, res) => {
//     try {
//         const boards = await Board.find(); // Fetch boards from the database
//         res.json(boards); // Send boards as JSON response
//     } catch (error) {
//         console.error('Error fetching boards:', error);
//         res.status(500).json({ error: 'Internal Server Error' }); // Handle error
//     }
// });


app.get('/blue/board', (req, res) => {
    res.sendFile(path.join(__dirname, 'board', 'board.html')); // Adjust the path as needed
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
