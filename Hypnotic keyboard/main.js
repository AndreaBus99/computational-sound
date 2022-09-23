

document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {}
    let gainNodes = {}

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);

            // Start hypnotizing each time a key is pressed
            requestID = window.requestAnimationFrame(start);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
    
            // Stop hypnotizing 
            if (requestID) {
                window.cancelAnimationFrame(requestID);
            }
            gainNodes[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);
            delete activeOscillators[key];
            delete gainNodes[key];
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)

        // Allow user to choose waveform
        let select = document.getElementById('waveform');
		let option = select.options[select.selectedIndex];
        
        if (option.id == 'sine'){
            osc.type = 'sine'
        }
        else if (option.id == 'sawtooth'){
            osc.type = 'sawtooth'
        }

        // Create gain node for clipping and clicking
        const gainNode = audioCtx.createGain(); //this will control the volume of all notes
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.connect(gainNode).connect(audioCtx.destination);
        osc.connect(gainNode);
        
        gainNode.connect(audioCtx.destination);

        osc.start();
        activeOscillators[key] = osc

        gainNodes[key] = gainNode;

        // Polyphonic mode: two nodes at the same time
        Object.keys(gainNodes).forEach(function(key) {
            gainNodes[key].gain.setTargetAtTime(
              0,
              audioCtx.currentTime,
              0.15
            );
          });
    
        gainNode.gain.setTargetAtTime(0.5, audioCtx.currentTime, 0.15);
    }

    // Set up spiral for animation
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let requestID = 0

    let gap = 4;
    let steps = 100;
    let increment = 2 * Math.PI / steps;
    let theta = increment;

    // Make static spiral for beginning
    while(theta < 40 * Math.PI) {
        let newX = centerX + theta * Math.cos(theta) * gap;
        let newY = centerY + theta * Math.sin(theta) * gap;
        context.lineTo(newX,newY);
        theta = theta + increment;
    }
    context.stroke();

    // Make the spiral for the animation 
    function spiral(time) {
        let angle = time / 60;
        context.beginPath();
        context.moveTo(centerX, centerY);
        let gap = 4;
        let steps = 100;

        letincrement = 4 * Math.PI / steps;
        let theta = increment;

        while (theta < 40 * Math.PI) {
            let newX = centerX + theta * Math.cos(theta + angle) * gap;
            let newY = centerY + theta * Math.sin(theta + angle) * gap;
            context.lineTo(newX, newY);
            theta = theta + increment;
        }
        context.stroke();
    }

    // Function to be called when key notes are pressed to start moving the spiral
    function start(time) { 
        context.clearRect(0, 0, canvas.width, canvas.height);
        spiral(time);
        // requestID to then stop the animation in keyup()
        requestID = window.requestAnimationFrame(start);
    }

})
