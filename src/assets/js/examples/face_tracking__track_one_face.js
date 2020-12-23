/**
 * Switch examples by selecting a different one from the dropdown menu.
 */

/**
 * This example repository uses browser native ES6 modules without any bundler.
 * With few adaptations the included utilities should also work in bundler environments.
 */

/**
 * BRFv5 - Track A Single Face
 *
 * This example tracks a single face and draws the default tracking results, eg.
 * detected faces, facial landmarks, face bounds etc, as well as the regions of interest.
 *
 * The configuration sets reasonable defaults for single face tracking.
 * We set some of the main values anyway for educational purposes.
 *
 * BRFv5 comes with more than one model. Please see face_tracking__choose_model.js for
 * more information.
 */

import { setupExample } from './setup__example.js'
import { trackCamera, trackImage } from './setup__example.js'

import { BRFv5FaceExtended } from '../utils/utils__face_extended.js'
import { brfv5 } from '../brfv5/brfv5__init.js'

import { SystemUtils } from '../utils/utils__system.js'

const faceExtended = new BRFv5FaceExtended()

let lmData = "";
let count = 0;

export const configureExample = (brfv5Config) => {

  // In most cases you only want to track one face. If you need to track more than one face
  // at a time, performance will be lower, because face tracking is a CPU intensive task.

  brfv5Config.faceTrackingConfig.numFacesToTrack = 1

  // numTrackingPasses: 3 (default), can either be 1, 2, 3, 4, 5 or 6.
  // 3 is a good trade-off between accuracy/stability and performance.
  // While 1 and 2 don't calculate the simple confidence value, 3 to 6 do.
  // The confidence value helps with resetting, if tracking should be lost be
  // keeps on tracking in wrong locations.

  // enableFreeRotation: true (default)
  // Enables rotationZ (head roll) to be larger than 34 degrees. This increased freedom
  // of head movement results in a bit of a performance loss, but it's most likely worth it.
  // Set it to false to restrict the head roll to -34 .. 0 .. 34 degrees.

  brfv5Config.faceTrackingConfig.numTrackingPasses = 3
  brfv5Config.faceTrackingConfig.enableFreeRotation = true
  brfv5Config.faceTrackingConfig.maxRotationZReset = 999.0
}

export const handleTrackingResults = (brfv5Manager, brfv5Config, canvas) => {

  const faces = brfv5Manager.getFaces()

  for (let i = 0; i < faces.length; i++) {

    const face = faces[i]

    if (face.state === brfv5.BRFv5State.FACE_TRACKING) {
      console.log(count)
      count++;

      // console.log(lmData)
      // alert(JSON.stringify(lmData)

      lmData = lmData + JSON.stringify(face.vertices) + ";"

      // alert(JSON.stringify(lmData))

      if (count == 20) {
        
        var template = {
          "message": lmData
        }
        var formattedTemplate = JSON.stringify(template)

        // console.log(formattedTemplate)

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var proxyUrl = "https://cors-anywhere.herokuapp.com/"
        var mlUrl = "https://asia-east2-igneous-stone-276102.cloudfunctions.net/facialEmotionPredictor-2"


        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: formattedTemplate,
          redirect: 'follow'
        };

        fetch(proxyUrl + mlUrl, requestOptions)
          // the response is in an object. Will be converted to text form.
          // then will console log it.
          .then(response => response.text())
          .then(result => {
            console.log(result)
            var display = document.getElementById("api-result");
            display.innerText = result;
          })
          .catch(error => console.log('error: ', error));

        // reset variables
        count = 0;
        lmData = "";
      }
    }
  }

  // No special handling necessary.
  // 'return true' will draw the default face tracking results in setup__example.js
  return true
}

// Each example can specify a few example specific config values.

const exampleConfig = {

  // See face_tracking__choose_model.js for more info about the models.
  modelName: '68l',
  numChunksToLoad: SystemUtils.isMobileOS ? 4 : 8,

  // If true, numTrackingPasses and enableFreeRotation will be set dynamically depending
  // on the app's CPU usage. See brfv5__dynamic_performance.js for more insights.
  enableDynamicPerformance: SystemUtils.isMobileOS,

  // onConfigure and onTracking are callbacks to setup example specific behaviour, eg.
  // for smile detection, PNG overlay or ThreeJS 3d object placement etc.
  onConfigure: configureExample,
  onTracking: handleTrackingResults
}

// run() will be called automatically after 1 second, if run isn't called immediately after the script was loaded.
// Exporting it allows re-running the configuration from within other scripts.

let timeoutId = -1

export const run = () => {

  clearTimeout(timeoutId)
  setupExample(exampleConfig)

  if (window.selectedSetup === 'image') {

    trackImage('./assets/tracking/' + window.selectedImage)

  } else {

    trackCamera()
  }
}

timeoutId = setTimeout(function () { run() }, 1000)

export default { run }

