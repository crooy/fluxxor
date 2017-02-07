module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "space-after-keywords":0,
        "space-return-throw-case":0,
        "no-empty-label":0,        
        "no-console":[
          "warn"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
