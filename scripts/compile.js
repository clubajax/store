var
    files,
    fs = require('fs'),
    dir = './src',
    ordered = ['store.js'],
    prefix = fs.readFileSync('scripts/umd_prefix.txt'),
    suffix = fs.readFileSync('scripts/umd_suffix.txt'),
    final = prefix + '\n';

function stripIIFE (file, index) {
    var beg = file.search(/\(function\s*\(/),
        end = file.search(/}\s*\(\s*window/);
    if(beg === -1 || end === -1){
        console.log('WARNING, potential parse problem with file', ordered[index]);
    }
    file = file.substring(0, end);
    file = file.substring(beg);
    file = file.substring(file.indexOf('\n'));
    return file;
}
fs.readdirSync(dir).forEach(function(fileName) {
    if(ordered.indexOf(fileName) === -1){
        ordered.push(fileName);
    }
});

files = ordered.map(function (fileName) {
    return fs.readFileSync(dir + '/' + fileName).toString();
});

files.forEach(function (file, i) {
    final += stripIIFE(file, i);
});
final += suffix;

try {
    fs.mkdirSync('dist');
}catch(e){
    // dir exists
}
fs.writeFileSync('dist/store.js', final);

//var test = fs.readFileSync(dir + '/fade.js').toString();
//console.log(stripIIFE(test));