const axios = require('axios');
const dotenv = require('dotenv');
const { OpenAIClient } = require('openai-node');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const openai = require('openai-node');



dotenv.config();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const vercelWebsiteName = 'landingpage';

openai.api_key = OPENAI_API_KEY;


async function deployVercel(htmlContent, projectName, vercelToken) {
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'vercel-'));
  const projectDir = path.join(tempDir, projectName);
  await fs.promises.mkdir(projectDir);

  // Write the HTML content to the index.html file
  await fs.promises.writeFile(path.join(projectDir, 'index.html'), htmlContent);

  // Write the vercel.json configuration file
  const vercelConfig = {
    "name": projectName,
    "version": 2,
    "builds": [{"src": "index.html", "use": "@vercel/static"}]
  };

  await fs.promises.writeFile(path.join(projectDir, 'vercel.json'), JSON.stringify(vercelConfig));

  try {
    const result = execSync(`vercel --token ${vercelToken} -y --prod`, { cwd: projectDir, encoding: 'utf-8' });
    console.log('Deployment READY!!');
    console.log(`Final URL: ${result.trim()}`);
  } catch (error) {
    console.log('Deployment failed:');
    console.log(error.stderr);
  }
}

async function createWebsite(user) {
  const prompt = `Using Tailwind CSS, generate HTML code for a responsive landing page for a software developer named IT TECH. The landing page should have the following sections and elements:

    1. A fixed top navbar with the developer's name "IT TECH" on the left and links to the different sections of the page: Home, FAQ, and Contact. Use the Tailwind CSS classes "bg-gray-800" and "text-white" for the navbar.
    
    2. A header section with a full-screen background image, a brief introduction of the developer, and a "Hire me" call-to-action button using the "bg-blue-500" and "text-white" classes.
    
    3. An FAQ section with a few sample questions and answers. Style the questions using the "text-xl" and "font-bold" classes, and the answers using the "text-gray-700" class.
    
    4. A footer with social media links (Twitter, GitHub, LinkedIn) and contact information (email address). Use the "bg-gray-800" and "text-white" classes for the footer.
    
    Please provide the complete HTML structure, along with the necessary Tailwind CSS classes and attributes.`;
  
    const response = await openai.Completion.create({
      engine: "gpt-4",
      prompt: prompt,
      max_tokens: 1500,
      n: 1,
      stop: null,
      temperature: 0.7,
  });

  console.log("Response from GPT-4:", response.choices[0].text.trim());

  const htmlContent = response.choices[0].text.trim();
  return htmlContent;
}
  
  
  
  
  
  


async function createPortfolio(user) {
    try {
      const response = await axios.get(`https://api.github.com/users/${user}`);
      console.log(response.data);
  
      const htmlContent = await createWebsite(response.data);
      await deployVercel(htmlContent, vercelWebsiteName, VERCEL_TOKEN);
    } catch (error) {
      console.log(`Error: Unable to fetch the page. Status code: ${error.response ? error.response.status : 'unknown'}`);
    }
  }
  
  const user = 'hugosmoreira';
  createPortfolio(user);



