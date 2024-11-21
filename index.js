// npc -> seconds only that are on cd

const milisecondsInAWeek = 604800000

const secondsInADay = 86400
const secondsInAHour = 3600
const secondsInAMinute = 60

let modalButton = null;

let data = {}
let checkedData = {}
let npc = '';
let test =86410

updateTimer = async() => {
    setInterval(async() =>{
        updateEach()
    }, 1000)
}

updateEach = async() => {
    const keys = Object.keys(data)
    for(let i = 0 ; i < keys.length; i++) {
        const dhm = await convertSecondsToHuman(data[keys[i]]['seconds'])
        document.getElementById(`timer_${keys[i]}`).textContent = `${dhm.d}d ${dhm.h}h ${dhm.m}m ${dhm.seconds}s`
        if (dhm.origSeconds == 0)
            stopTimer(keys[i])
        else
            data[keys[i]]['seconds'] = dhm.origSeconds
    }

}
convertSecondsToHuman = async(seconds) => {
    let origSeconds = seconds
    const d = Math.floor(seconds / secondsInADay)
    seconds %= secondsInADay
    const h = Math.floor(seconds / secondsInAHour)
    seconds %= secondsInAHour
    const m = Math.floor(seconds / secondsInAMinute)
    seconds %= secondsInAMinute
    origSeconds--
    return {
        d, h, m, seconds, origSeconds
    }
}

stopTimer = async(npc) => {
    delete data[npc]
    saveDataToLocalStorage()
    document.getElementById(`timer_${npc}`).textContent = '7d 0h 0m 0s'
    resetCheckBox(npc)
}

startTimer = async(npc, dateTime = (new Date().getTime() + milisecondsInAWeek), seconds = (milisecondsInAWeek/1000)) => {
    if (npc == '') {
        alert(`Error please try again`)
        console.log('')
        return
    }
    data[npc] = {
        'timestamp': dateTime,
        'seconds': seconds,
    }
    await setDateTime(npc, dateTime)
    await resetCheckBox(npc)
    await saveDataToLocalStorage()
}

setDateTime = async(npc, timestamp) => {
    console.log(npc)
    let d = new Date(timestamp)
    document.getElementById(`date_${npc}`).textContent = d.toLocaleString()
}

resetCheckBox = async(npc) => {
    delete checkedData[npc]
    saveCheckedDataToLocalStorage()
    document.getElementById(`empty_${npc}`).checked = false
}
saveDataToLocalStorage = async() => {
    localStorage.setItem('npcTimers', JSON.stringify(data))
    return
}

loadDataFromLocalStorage = async() => {
    const storageData = localStorage.getItem('npcTimers')

    if (storageData == 'undefined' || !storageData) {
        localStorage.setItem('npcTimers', JSON.stringify({}))
        return {}
    }
    data = JSON.parse(storageData)
    await updateSecondDifferenceInData()
    await loadAndDisplayCheckedData()
    return
}

loadAndDisplayCheckedData = async() => {
    const storageCheckedData = localStorage.getItem('checkedData')
    if(!storageCheckedData) {
        localStorage.setItem('checkedData', JSON.stringify({}))
        return
    }
    checkedData = JSON.parse(storageCheckedData)
    const keys = Object.keys(checkedData)
    for ( let i = 0; i < keys.length; i++) {
        document.getElementById(`empty_${keys[i]}`).checked = Boolean(checkedData[keys[i]]['checked'])
    }
}
// rename this lol, currently so i dont have to iterate twice
updateSecondDifferenceInData = async() => {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
        const timestamp = data[keys[i]]['timestamp']
        setDateTime(keys[i], timestamp)
        const seconds = Math.floor((timestamp - new Date().getTime()) / 1000)
        if (seconds < 0) {
            delete data[keys[i]]
            continue
        }
        data[keys[i]]['seconds'] = seconds
    }
    return
}

saveCheckedDataToLocalStorage = async() => {
    localStorage.setItem('checkedData', JSON.stringify(checkedData))
}

window.onload = async(event) => {
    const startButtons = document.querySelectorAll('.btn-start')
    const stopButtons = document.querySelectorAll('.btn-stop')
    const checkBoxes = document.querySelectorAll('.cb')
    startButtons.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            const id = btn.id
            npc = id.split('_')[1]
        })
    })
    stopButtons.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            const id= btn.id
            const npc = id.split('_')[1]
            stopTimer(npc)
        })  
    })
    checkBoxes.forEach((cb, i) => {
        cb.addEventListener('change', (e) => {
            const id = cb.id
            const npc = id.split('_')[1]
            checkedData[npc] = {
                'checked': cb.checked
            }
            saveCheckedDataToLocalStorage()
        })
    })
    let modalButton = document.getElementById('startModalButton')

    modalButton.addEventListener('click', async(e) => {
        const d = Number(document.getElementById('input_Days').value)
        const h = Number(document.getElementById('input_Hours').value)
        const m = Number(document.getElementById('input_Minutes').value)
        const s = Number(document.getElementById('input_Seconds').value)
        const extraMs = (d*86400 + h*3600 + m*60 + s) * 1000
        const timestamp = new Date().getTime() + extraMs
        await startTimer(npc, timestamp, extraMs / 1000)
        document.getElementById('input_Days').value = 6
        document.getElementById('input_Hours').value = 23
        document.getElementById('input_Minutes').value = 59
        document.getElementById('input_Seconds').value = 59
        $('#myModal').modal('hide')
    })


    await loadDataFromLocalStorage()
    updateTimer()
}

window.onfocus = () => {
    loadDataFromLocalStorage()
}
