
let app = document.querySelector('#app')
let dataClasses = {}

window.getInputValue = function(event){
    event.preventDefault()
    let inputValue = document.getElementById("input-id").value

    if (inputValue!=''){
        logIn(inputValue)
    } else {
        window.alert('El campo de id esta vacio')
    }
    
}

function formatDate(dateISO) {

    let myDate = new Date(dateISO)

    let optionsDate = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
    }

    let optionsDateShort = {  
        day: 'numeric', 
        month: 'short', 
    }

    let optionsHour = { 
        hour: '2-digit', 
        minute: '2-digit', 
        // hour12: true, 
    }

    let formatedDate = myDate.toLocaleDateString('es-ES', optionsDate)
    let formatedDateShort = myDate.toLocaleDateString('es-ES', optionsDateShort)
    let formatedHour = myDate.toLocaleTimeString('es-ES', optionsHour)

    return {formatedDate: formatedDate, formatedHour: formatedHour, formatedDateShort: formatedDateShort}
}

function formatData(data){

  const grouped = data.reduce((acc, item) => {
    const dateKey = item.start_date.split("T")[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(item)
    return acc
  }, {})
  
  const sortedGrouped = Object.keys(grouped)
    .sort()
    .map(date => ({
      start_date: date,
      elements: grouped[date]
    }))

    return sortedGrouped
}

function logIn(userId){

    fetch('/log-in', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({'userId': userId})})
    .then(response => response.json())
    .then(data => {

        dataClasses = data
        console.log(dataClasses)

        sessionStorage.setItem("token", dataClasses.token)

        if (dataClasses.available.length > 0){

            //formatear array
            let newDataAvailable = formatData(dataClasses.available)
            console.log('available: ', newDataAvailable)

            newDataAvailable.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('avail')
            //Llamar funcion createCards() enviando data para iterar
            createCards(newDataAvailable, container, 'avail')
            addFilterEventListeners()
            addEventListenersFilterButtons()

        } else if (dataClasses.reserved.length > 0){

            //formatear array
            let newDataReserved = formatData(dataClasses.reserved)
            console.log('reserved: ', newDataReserved)

            newDataReserved.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            //Llamar funcion para crear container principales
            let container = createContainersAndFilters('reserved')
            //Llamar funcion createCards() enviando data para iterar
            createCards(newDataReserved, container, 'reserved')
            addFilterEventListeners()
            addEventListenersFilterButtons()

            } else {
            window.alert("No hay clases disponibles")
        }
    })
}

function registerClass(classId){

    fetch('/reserve', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({'classId': classId, 'token': token})})
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })}

function addEventListenersRegisterButtons() {
    const RegisterButtons = document.getElementsByClassName('register-button')

    for (let item of RegisterButtons) {
        item.addEventListener("click", function() {
            let classId = this.id
            let classInfo = document.getElementById(`body_${classId}`).innerHTML

            if (window.confirm(`¿Quieres registrarte a esta clase?\n${classInfo}`)) {
                console.log(`Registrando en la clase con ID: ${classId}`)
                //registerClass(classId)
            }
        })
    }
}

function addEventListenersFilterButtons(){

    const filterButtons = document.getElementsByClassName('filterButton')
    const filtersActivated = []

    for (let item of filterButtons) {
        item.addEventListener("click", function(){

            let clickedFilter = 'clickedFilter'
            let isSelected = item.classList.contains(clickedFilter)

           if (!isSelected) {
            item.classList.add(clickedFilter)
            filtersActivated.push(item.innerHTML)
            applyFilters(filtersActivated)
           } else {
            item.classList.remove(clickedFilter)
            let index = filtersActivated.indexOf(item.innerHTML)
            filtersActivated.splice(index, 1)
            applyFilters(filtersActivated)
           }
            
        })
    }
}

function applyFilters(ids){

    let classsList = document.getElementsByClassName('details')

    for (let item of classsList) {
        
        let itemId = item.id
        let isInSelectedList = ids.includes(itemId)
        
        if (ids.length === 0){

            item.classList.remove("hiddenDetails")
        } else {

            if (!isInSelectedList) {
                item.classList.add("hiddenDetails")
            } else {
                item.classList.remove("hiddenDetails")
            }  
        }
    }
}

function addFilterEventListeners(){

    const availRadioButtons = document.getElementById('available')
    const reservedRadioButtons = document.getElementById('reserved')

    availRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('avail')
        //formatear array
        let newDataAvailable = formatData(dataClasses.available)
        console.log('available: ', newDataAvailable)
        createCards(newDataAvailable, containerR, 'avail')
        addEventListenersFilterButtons()

    })

    reservedRadioButtons.addEventListener("click", () => {

        removeMainContainer()
        let containerR = createContainersAndFilters('reserved')
        //formatear array
        let newDataReserved = formatData(dataClasses.reserved)
        console.log('reserved: ', newDataReserved)
        createCards(newDataReserved, containerR, 'reserved')
        addEventListenersFilterButtons()


    })

}


function createContainersAndFilters(type){

    let filtersExist = document.body.contains(document.getElementById('reserved'))
    let typeRequest = type
    const appResults = document.getElementById('app')

        // Create main container for filters
        const containerResults = document.createElement('div')
        containerResults.classList.add('main-container-results')


        if (!filtersExist){
            //create radio container filters disponibles or programadas
            const filtersContainer = document.createElement('div')
            filtersContainer.classList.add('radio-inputs')

            //Create filter 1 "available"
            const labelFilter1 = document.createElement('label')
            labelFilter1.classList.add('radio')

            const inputFilter1 = document.createElement('input')
            inputFilter1.type = "radio"
            inputFilter1.name = "radio"
            inputFilter1.id = "available"

            if (typeRequest==='avail') {
                inputFilter1.checked = true
            }

            const spanFilter1 = document.createElement('span')
            spanFilter1.classList.add('name')
            spanFilter1.innerText = "Disponibles"

            labelFilter1.append(inputFilter1, spanFilter1)
            filtersContainer.append(labelFilter1)
            
            //Create filter 2 "programadas"

            const labelFilter2 = document.createElement('label')
            labelFilter2.classList.add('radio')

            const inputFilter2 = document.createElement('input')
            inputFilter2.type = "radio"
            inputFilter2.name = "radio"
            inputFilter2.id = "reserved"
            
            if (typeRequest!='avail') {
                inputFilter2.checked = true
            }

            const spanFilter2 = document.createElement('span')
            spanFilter2.classList.add('name')
            spanFilter2.innerText = "Programadas"

            labelFilter2.append(inputFilter2, spanFilter2)
            filtersContainer.append(labelFilter2)
            
            //agregar a app
            appResults.append(filtersContainer)
        }

        // Create subtitle
        const pageSubtitle = document.createElement('h2')
        pageSubtitle.classList.add('subtitle')

        if (typeRequest==='avail'){
            pageSubtitle.innerText = "Clases disponibles"
        } else {
            pageSubtitle.innerText = "Clases programadas"
        }
        
        containerResults.append(pageSubtitle)

        //Agregar a app
        appResults.append(containerResults)

        //Llamar animacion             
        menuAnimation(containerResults)

        //Llamar funcion createCards() sending data to iterate
        // createCards(data.available, containerResults)

        return containerResults
}


function createCards(data, containerR, typeRequest){    
    // Loop for creating cards
    console.log(data)

    data.forEach((item) => {
        const filterButtons = document.createElement('button')
        filterButtons.classList.add('filterButton')
        let formatedDate = formatDate(item.start_date)
        filterButtons.innerText = formatedDate.formatedDateShort
        containerR.append(filterButtons) 
    })

    data.forEach((item) => {

        const details = document.createElement('details')
        details.classList.add('details')

        const summary = document.createElement('summary')
        summary.classList.add('summary')
        let formatedDate = formatDate(item.start_date)
        details.id =formatedDate.formatedDateShort
        summary.innerText = `Clases para ${formatedDate.formatedDate}`   
        
        details.append(summary)
        containerR.append(details) 

        const elements = item.elements

        elements.forEach((element)=>{

            const container = document.createElement('div')
            container.classList.add('container')

            const cardBar = document.createElement('div')
            cardBar.classList.add('card-bar')
            container.append(cardBar)
            
            const cardContainer = document.createElement('div')
            cardContainer.classList.add('card-container')
            
            const cardBodyContainer = document.createElement('div')
            cardBodyContainer.classList.add('card-body-container')
    
            const title = document.createElement('h3')
            title.classList.add('card-title')
            title.innerText = element.teacher_name
    
            const classDate = document.createElement('p')
            classDate.classList.add('card-body')
            classDate.id = `body_${element.id}`
            let formatedDate = formatDate(element.start_date)
            let bodyCardTxt = `El ${formatedDate.formatedDate} a las ${formatedDate.formatedHour} hora Colombia`
            classDate.innerText = bodyCardTxt
            
            cardBodyContainer.append(title, classDate)
            cardContainer.append(cardBodyContainer)
            container.append(cardContainer)
            details.append(container)

            if (typeRequest==='avail'){
                const spanButton = document.createElement('div')
                spanButton.classList.add('card-span-button')
                spanButton.classList.add('register-button')
                spanButton.innerText = 'Registrar'
                spanButton.id = element.id
                cardContainer.append(spanButton)
                }

            if (typeRequest!='avail'){

                var zoomId = element.location_name.match(/\d{3}-\d{3}-\d{4}/)
                zoomId = zoomId[0].replace(/-/g, "")
                let zoomUrl = `zoommtg://zoom.us/join?action=join&confno=${zoomId}&pwd=1` 
                console.log(zoomUrl)

                const joinButton = document.createElement('div')
                joinButton.classList.add('card-span-button')
                joinButton.innerText = 'Unirme'
                cardContainer.append(joinButton)

                const classDetail = document.createElement('p')
                classDetail.classList.add('class-detail')
                classDetail.innerText = element.classDetails['session_name']
                cardBodyContainer.append(classDetail)

                joinButton.addEventListener("click", () => {
                    window.open(zoomUrl, "_blank")
                })
            }

        }) 
      
    })
    var arrowButton = document.querySelector('.arrow')
    arrowButton.style.display = 'block'
    addEventListenersRegisterButtons()
}

function menuAnimation(){
    let w = window.innerWidth
    let animationY = -300

    if (w<500) {
        animationY = -400
    } 

    let myAnimation = anime({
        targets: ['.main-container', '.availabilityApp'],
        translateY: animationY,
        duration: 3000
    })
}

let arrow = document.getElementById('arrow-down')

arrow.addEventListener("click", (e) => {
    menuAnimationOut()
  })

function menuAnimationOut(){
    let myAnimation = anime({
        targets: ['.main-container'],
        translateY: 0,
        duration: 3000
    })
    let filtersContainer = document.querySelector('.radio-inputs')
    filtersContainer.remove()

    removeMainContainer()

    let arrowButton = document.querySelector('.arrow')
    arrowButton.style.display = 'none'

}

async function createButton() {
    const response = await fetch('/static/icons/calendar_icon.html')
    const data = await response.text()
    return data
  }

function removeMainContainer(){
    let availabilityContainer = document.querySelector('.main-container-results')
    availabilityContainer.remove()
}


// const handleAgendar = () => {
//     console.log(clasesPreseleccionadas[0]);
//     var putClassRegistrationUrl = `${process.env.REACT_APP_API_URL}/api/v1/class/${clasesPreseleccionadas[0]}/registration`;
//     fetch(putClassRegistrationUrl, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + Cookies.get("token"),
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           return response.json().then((data) => {
//             throw new Error(data.message);
//           });
//         }
//         Si la respuesta es exitosa, puedes continuar con el código aquí
//         Ejemplo: showNotification("¡Éxito!", "La clase se ha registrado correctamente", "success");
//         showNotification("Info", "Clase registrada", "success");
//         setTimeout(() => {
//           window.location.reload();
//         }, 1000);
//       })
//       .catch((error) => {
//         Aquí puedes mostrar el mensaje de error en una notificación o en algún otro lugar de tu interfaz de usuario
//         showNotification("Error", error.message, "warning");
//       });
//   };
//   /*

