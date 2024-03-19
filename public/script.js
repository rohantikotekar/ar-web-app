const uploadForm = document.getElementById('uploadForm');
const uploadButton = document.getElementById('uploadButton');

uploadButton.addEventListener('click', async () => {
  const formData = new FormData(uploadForm);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      // Show the download button
      document.getElementById('downloadButton').style.display = 'inline-block';
      console.log('Upload successful');
    } else {
      console.error('Upload failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Add event listener for the download button
const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', async () => {
  try {
    // Download the generated .usdz file
    const response = await fetch('/download', {
      method: 'GET'
    });

    if (response.ok) {
      // Create a blob URL for the file and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.usdz';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Download failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
