const fs = require("fs");
const {execSync} = require("child_process");

if (require.main === module) {
    const args = process.argv.slice(2);
    const ngVersion = args && args[0];
    if (ngVersion !== 'ng9' && ngVersion !== 'ng18') {
        throw 'Invalid ngVersion, need ng9 or ng18!';
    }
    npmInstall(ngVersion);
}

module.exports = {npmInstall, exec};

function npmInstall(ngVersion) {
    if (!ngVersion) {
        throw 'Invalid ngVersion, need ng9 or ng18!';
    }
    console.log(`installing ${ngVersion} dependencies ...`);
    if (global.inDocker) {
        exec('cp package.json package.json.bak', { stdio: 'inherit' });
    } else {
        exec('git checkout package.json package-lock.json', { stdio: 'inherit' });
    }
    if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
    }
    const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
    packageJson.dependencies = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependencies};
    packageJson.dependenciesGovernance = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependenciesGovernance};
    packageJson.devDependencies = {...packageJson[`${ngVersion}DevDependencies`], ...packageJson.devDependencies};
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
    exec(`npm install --force --ignore-scripts --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-npm-virtual/`);
    if (global.inDocker) {
        exec('rm -f package.json', {stdio: 'inherit'});
        exec('mv package.json.bak package.json', {stdio: 'inherit'});
    } else {
        exec('git checkout package.json package-lock.json', {stdio: 'inherit'});
    }
}

function exec(cmd) {
    try {
        execSync(cmd, {stdio: 'inherit'});
        return 0;
    } catch (e) {
        return e.status;
    }
}
