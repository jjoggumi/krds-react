module.exports={
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    testMatch:['**/*.spec.[jt]s?(x)','**/*.test.[jt]s?(x)'],
    moduleFileExtensions: [
        'js',
        'jsx',
        'json',
        'vue'
    ],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.jsx?$': 'babel-jest'
    },
    snapshotSerializers: [
        'jest-serializer-vue'
    ]
}
