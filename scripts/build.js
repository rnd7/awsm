import fs from 'fs-extra'
import webpack from 'webpack'
import path from 'path'

function bundleWorklet() {
    return new Promise((resolve, reject)=>{
        webpack({
            entry: {
                "wave-spline-processor": './src/audio/wave-spline-processor.js',
            },
            output: {
                path: path.resolve('./', 'dist/audio/'),
                filename: '[name].js'
            },
            optimization: {
                minimize: false
            }
        }, (err, stats) => {
            if (err || stats.hasErrors()) {
                console.log(stats)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

async function build() {
    console.log("Build AWSM")
    try {
        console.info("Remoce dir")
        await fs.remove('./dist')
        console.info("Copy files")
        await fs.copy('./src', './dist')
        console.info("Bundle Worklet")
        await bundleWorklet()
        console.info("Done")
    } catch(e) {
        console.error(e)
    }
}

build()