var webdriverjs = require('webdriverjs');
var client = {};

client = webdriverjs.remote({ logLevel: "silent", desiredCapabilities: {browserName: 'firefox'} });
client.init(function() {
    run();
});

var counter = 100;
var results = {};

function end() {

    counter--;

    if (counter == 0) {

        console.log("");
        for(var size in results) {
            console.log(size, results[size]);
        }

        client.end(function() {
            process.exit(0);
        });
    }
    else {
        run();
    }

}


function run() {


    client
        .url('file://localhost/Users/camilo/Projects/require-css-order/index2.html')
        .getElementSize('#color', function(err, result) {
            var resultId = result.width + "x" + result.height;
            if (!results[resultId]) {
                results[resultId] = 0;
            }
            results[resultId]++;
            process.stdout.write(".");
            //console.log(resultId);
            end();
        });


}
