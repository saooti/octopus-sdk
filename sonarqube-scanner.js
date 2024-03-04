const scanner = require('sonarqube-scanner'); 
scanner({ 
    options:{
        "sonar.sources":"./src" 
    },
    serverUrl:"http://localhost:9000",
}, 
()=>process.exit() 
);
//Login/password not working with last version sonar so give the permission with admin and then run