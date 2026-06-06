import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  let commits = '';

  const commitsPath = path.join('.github', 'raw-commits.txt');
  if (fs.existsSync(commitsPath)) {
    commits = fs.readFileSync(commitsPath, 'utf8').trim();
  }

  if (!apiKey || !apiKey.trim()) {
    console.warn('GEMINI_API_KEY is not set or empty. Falling back to raw commit list.');
    fs.writeFileSync('changelog.txt', '## Changes\n\n' + (commits || 'No changes recorded.'));
    return;
  }

  if (!commits) {
    console.warn('No commits found to process. Generating fallback log.');
    fs.writeFileSync('changelog.txt', '## Changes\n\nNo changes recorded.');
    return;
  }

  try {
    let prompt = fs.readFileSync('.github/changelog-prompt.txt', 'utf8');
    
    prompt = prompt.replace('{{COMMITS}}', commits);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const markdownChangelog = data.candidates[0].content.parts[0].text;
      fs.writeFileSync('changelog.txt', markdownChangelog);
      console.log('Changelog generated successfully via Gemini AI.');
    } else {
      throw new Error('Unexpected JSON structure from Gemini API response.');
    }
  } catch (error) {
    console.error('Error generating AI changelog:', error);
    fs.writeFileSync('changelog.txt', '## Changes (Automatic Fallback)\n\n' + commits);
  } finally {
    if (fs.existsSync(commitsPath)) {
      fs.unlinkSync(commitsPath);
    }
  }
}

run();