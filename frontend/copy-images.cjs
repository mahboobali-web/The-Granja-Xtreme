const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Mysterious/.gemini/antigravity-ide/brain/e69af83b-fc87-49f2-b888-9787182c73f8';
const destDir = path.join(__dirname, 'public/images');

// Ensure destination directory exists
if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

const fileMap = {
  'atv_hero_banner_1781620616734.png': 'hero_banner.png',
  'atv_polaris_570_1781620637717.png': 'polaris_570.png',
  'atv_yamaha_grizzly_1781620655932.png': 'yamaha_grizzly.png',
  'atv_canam_outlander_1781620677292.png': 'canam_outlander.png',
  'gallery_sunset_mountain_1781620693004.png': 'gallery_sunset_mountain.png',
  'gallery_muddy_tire_1781620710509.png': 'gallery_muddy_tire.png',
  'gallery_winding_path_1781620727405.png': 'gallery_winding_path.png',
  'gallery_dense_jungle_1781620743522.png': 'gallery_dense_jungle.png',
  'media__1781620812476.jpg': 'logo.jpg',
  'atv_honda_rubicon_1781621444542.png': 'honda_rubicon.png',
  'atv_kawasaki_brute_1781621466699.png': 'kawasaki_brute.png',
  'atv_suzuki_kingquad_1781621492362.png': 'suzuki_kingquad.png',
  'atv_polaris_scrambler_1781621515062.png': 'polaris_scrambler.png'
};

Object.entries(fileMap).forEach(([srcName, destName]) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${srcName} to ${destName}`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
});
