const { exec } = require('child_process');
const fs = require('fs');
const tagPrefix = `${process.env.INPUT_PREFIX || ''}*`;

exec(`git for-each-ref --sort=-v:refname --format="%(refname:short)" "refs/tags/${tagPrefix}"`, (err, stdout, stderr) => {

  var build_tag_hash = {};
  tags = stdout.split("\n");

  for(i=0;i<tags.length;i++){
     temp_tag = tags[i];
     temp_tag_array = temp_tag.split(".");
     build_number = temp_tag_array[temp_tag_array.length-1];
     build_number = build_number.replace(new RegExp("-r"),"");
     build_tag_hash[build_number] = temp_tag;
  }
  sorted = Object.keys(build_tag_hash).sort();
  last_build_number = sorted[sorted.length-1];
  previous_tag = build_tag_hash[last_build_number];

  if (err) {
      console.log('\x1b[33m%s\x1b[0m', 'Could not find any tags because: ');
      console.log('\x1b[31m%s\x1b[0m', stderr);
      process.exit(1);
  } else if (previous_tag === "") {
      let timestamp = Math.floor(new Date().getTime() / 1000);
      console.log('\x1b[33m%s\x1b[0m', 'Falling back to default tag');
      console.log('\x1b[32m%s\x1b[0m', `Found tag: ${process.env.INPUT_FALLBACK}`);
      console.log('\x1b[32m%s\x1b[0m', `Found timestamp: ${timestamp}`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${process.env.INPUT_FALLBACK}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `timestamp=${timestamp}\n`);
      process.exit(0);
  } else {
       fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag=${previous_tag}\n`);
  } 
});
