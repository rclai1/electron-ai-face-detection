# Downloads:

You can try out application on your own Windows machine here: https://drive.google.com/file/d/1nCeUlUhh7YTopuapzIDEMCBhIbXbsUhe/view?usp=sharing

# Background
## Inspiration

We wanted to create something that tackled misinformation on social media, especially through the form of AI-generated videos and screenshots. We decided to focus on faces, due to their common usage in video and image-based misinformation, and also derived inspiration from the [https://thispersondoesnotexist.com](thispersondoesnotexist.com) website.

## What it does

Fake Face Detector takes in uploaded images from the user, and runs a custom AI model that classifies the provided image as either "real" or "fake". We've also deployed a beta Windows-only desktop version, that allows the user to also have the option to directly take a screenshot through the application, creating a more streamlined process that bypasses the previous upload step required in the website.

## How we built it

The backend of Fake Face Detector utilizes a custom AI transformer model fine-tuned from the preexisting BEiT image classification model. We used Hugging Face libraries and CUDA-based GPUs to train the BEiT model on datasets of real and fake faces, and then created our own custom API endpoint for the application to call. On the front end, we utilized NextJS to create our initial web-based application, wrapped it with Electron to migrate our interface onto desktop, and using native OS snipping tools for our screenshot functionality.

## Challenges we ran into

Our initial dataset that we trained the model on had issues with quality that we didn't notice until later, such as all images of certain types having blurred backgrounds, harming model quality. We also ran into issues with deploying the screenshot ability, as Electron didn't natively support image-based screenshot options with snipping ability.

## Accomplishments that we're proud of

We were able to make our own custom model with very high accuracy, as well as create a visually pleasing and intuitive UI to improve the user experience. We were also able to leverage the school's available GPU resources to our advantage to help with the training process.

## What we learned

Dataset quality matters - a lot. Our first dataset was very promising on paper, with a variety of labelled sources for fake images for more detail in classification. However, the actual quality of the data wasn't up to par, and that was enough to significantly disrupt the model's ability to identify fakes.

## What's next for Fake Face Detector

Solidifying our desktop application and functionality is a big priority on the front-end, as it allows for much more options on the user's side. Potential new avenues include being able to allow the app to run in the background with very low resources, and being able to enable trigger the screenshot -> upload process through a keyboard shortcut instead of having to open the app. On the backend, a more sophisticated model able to go a step further and identify the source used to create the fake face is also a goal of ours.

# Credits and Links

 - Our Hugging Face model: [https://huggingface.co/kpeng-05/fake-face-classification-lite](https://huggingface.co/kpeng-05/fake-face-classification-lite)
 - Credits to xhlulu for their [dataset](https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces)
 - Credits to Microsoft for their [BEiT model](https://huggingface.co/microsoft/beit-base-patch16-224) that we fine-tuned on
