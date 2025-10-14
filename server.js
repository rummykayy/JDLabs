const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the 'public' directory.
// This is crucial for serving robots.txt, sitemap.xml, images, etc.
app.use(express.static(path.join(__dirname, 'public')));

// For any other request, serve the index.html file.
// This is the fallback for Single-Page Application (SPA) routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
