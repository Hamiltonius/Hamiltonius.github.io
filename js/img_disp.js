// Select the element where you want to display the image
const imageContainer = document.getElementById('image-container');

// Create new Image objects and set the sources
const image1 = new Image();
image1.src = '/Users/tgalarneau2024/Desktop/Business folder/Consumer_ad.jpg';

const image2 = new Image();
image2.src = '/Users/tgalarneau2024/Desktop/Business folder/Your_Sample_data.jpg';

// Append the image elements to the container
imageContainer.appendChild(image1);
imageContainer.appendChild(image2);