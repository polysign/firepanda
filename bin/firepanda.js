const ora = require('ora');
const delay = require('delay');


const run = async () => {
  console.info('Firepanda CLI');
  const spinner = ora({
    spinner: { interval: 250, frames: ['   ', '|  ', '|| ', '|||', ' ||', '  |', '   '] }
  });

  spinner.start();

  spinner.text = 'Building models started';
  await delay(1000);
  spinner.text = 'Building firestore rules started';
  spinner.color = 'yellow';
  await delay(1000);
  spinner.text = 'Building firestore rules done';
  spinner.color = 'green';
  await delay(1000);
  spinner.text = 'Building models done';
  spinner.color = 'yellow';
  await delay(1000);
  spinner.text = 'Building cloud functions started';
  spinner.color = 'green';
  await delay(1000);
  spinner.text = 'Building cloud functions done';
  spinner.color = 'red';
  await delay(1000);
  spinner.text = 'Deploying cloud functions started';
  spinner.color = 'green';
  await delay(1000);
  spinner.text = 'Deploying cloud functions done';
  spinner.color = 'yellow';
  await delay(1000);
  spinner.text = 'Deploying hosting';
  spinner.color = 'red';
  await delay(1000);

  process.exit();
}

run();